# Cinema icon

The mark is four rounded tiles on a dark squircle: one white, one red (#e50914), two grey. Everything is generated from the definition in `generate.js`:

```
npm i sharp png-to-ico        # once, anywhere; or set ICON_MODULES to a node_modules folder
node branding/generate.js
```

| Output | Use |
|---|---|
| `icon.svg`, `favicon.svg` | web tab icon (also embedded in `src/boot.js`), plugin catalogue |
| `icon-square.svg`, `png/icon-512-square.png` | store listings that want a full square |
| `png/icon-*.png`, `icon.ico`, `favicon.ico` | desktop installers, docs, plugin image |
| `android/res/…` | launcher icon (adaptive with themed layer) and the TV banner; copied into `tv/app/src/main/res` |

Desktop (Tauri): `npx tauri icon branding/png/icon-1024.png` inside `desktop/src-tauri` creates the Windows, macOS and Linux sets.
