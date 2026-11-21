#!/usr/bin/env python3
"""One GitHub release for everything: plugin, Android app and desktop app.

    python scripts/release.py v3.0.0 [--notes notes.md] [--dry-run]

Reads the current version of each part from the project files, takes the finished files from `releases/`
    Cinema_<plugin>.zip              Jellyfin plugin (also installable through the plugin repository)
    Cinema-<app>.apk                 Android phone, tablet and TV
    Cinema-Desktop-<desktop>-setup.exe   Windows
and uploads them to one release together with a SHA256SUMS.txt and a download table. Re-running adds missing files only.
The Android app's update hint finds `Cinema-<version>.apk` in any release, so nothing else has to be changed there.
The GitHub token comes from the git credential store (the one `git push` uses).
"""
import hashlib, json, os, re, subprocess, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = 'xDafric/jellyfin-plugin-cinema'


def read(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f:
        return f.read()


def versions():
    plugin = re.search(r'<AssemblyVersion>([\d.]+)</AssemblyVersion>', read('plugin/Jellyfin.Plugin.Cinema/Jellyfin.Plugin.Cinema.csproj')).group(1)
    app = re.search(r'versionName\s*=\s*"([\d.]+)"', read('tv/app/build.gradle.kts')).group(1)
    desktop = json.loads(read('desktop/src-tauri/tauri.conf.json'))['version']
    return plugin, app, desktop


def token():
    out = subprocess.run(['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\n\n', capture_output=True, text=True, cwd=ROOT).stdout
    t = dict(l.split('=', 1) for l in out.splitlines() if '=' in l).get('password')
    if not t:
        sys.exit('No GitHub token in the git credential store.')
    return t


def call(tok, method, url, data=None, raw=None, ctype=None):
    h = {'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json', 'User-Agent': 'cinema-release'}
    body = raw
    if data is not None:
        body = json.dumps(data).encode(); h['Content-Type'] = 'application/json'
    if ctype:
        h['Content-Type'] = ctype
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read() or b'null')
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b'null')


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry-run' in sys.argv
    if not args or not re.fullmatch(r'v\d+(\.\d+)*', args[0]):
        sys.exit(__doc__)
    tag = args[0]
    notes_file = sys.argv[sys.argv.index('--notes') + 1] if '--notes' in sys.argv else None
    plugin, app, desktop = versions()
    files = [
        ('Jellyfin plugin (server)', f'Cinema_{plugin}.zip', 'application/zip', plugin),
        ('Android phone, tablet and TV', f'Cinema-{app}.apk', 'application/vnd.android.package-archive', app),
        ('Windows desktop', f'Cinema-Desktop-{desktop}-setup.exe', 'application/octet-stream', desktop),
    ]
    missing = [n for _, n, _, _ in files if not os.path.exists(os.path.join(ROOT, 'releases', n))]
    if missing:
        sys.exit('Missing in releases/: ' + ', '.join(missing))

    sums = ''.join(f'{hashlib.sha256(open(os.path.join(ROOT, "releases", n), "rb").read()).hexdigest()}  {n}\n' for _, n, _, _ in files)
    table = '| Part | File | Version |\n|---|---|---|\n' + ''.join(f'| {what} | `{n}` | {v} |\n' for what, n, _, v in files)
    notes = (open(notes_file, encoding='utf-8').read().strip() + '\n\n') if notes_file else ''
    body = (notes + '## Downloads\n\n' + table +
            '\nPlugin: add `https://raw.githubusercontent.com/xDafric/jellyfin-plugin-cinema/main/manifest.json` to the Jellyfin plugin repositories and update from there '
            '(the zip is only for manual installs). Install the plugin first: the apps load their interface from it.\n'
            'Android: open the APK (allow installs from this source). The app tells you when a newer release is out.\n'
            'Windows: run the installer. It is not code signed yet, so SmartScreen may ask once (More info, Run anyway).\n\n'
            'SHA-256 checksums are in `SHA256SUMS.txt`.\n')
    print(f'{tag}: plugin {plugin}, app {app}, desktop {desktop}')
    if dry:
        print(body); return

    tok = token()
    st, rel = call(tok, 'GET', f'https://api.github.com/repos/{REPO}/releases/tags/{tag}')
    if st != 200:
        st, rel = call(tok, 'POST', f'https://api.github.com/repos/{REPO}/releases', {'tag_name': tag, 'target_commitish': 'main', 'name': f'Cinema {tag[1:]}', 'body': body, 'draft': False, 'prerelease': False})
        print('release created' if st == 201 else f'create failed {st} {rel}')
        if st != 201:
            sys.exit(1)
    have = {a['name'] for a in rel.get('assets', [])}
    up = rel['upload_url'].split('{')[0]
    for _, n, ctype, _ in files:
        if n in have:
            print('already there:', n); continue
        st, a = call(tok, 'POST', f'{up}?name={n}', raw=open(os.path.join(ROOT, 'releases', n), 'rb').read(), ctype=ctype)
        print('uploaded' if st == 201 else f'FAILED {st} {a}', n)
    if 'SHA256SUMS.txt' not in have:
        call(tok, 'POST', f'{up}?name=SHA256SUMS.txt', raw=sums.encode(), ctype='text/plain')
    print(rel['html_url'])


if __name__ == '__main__':
    main()
