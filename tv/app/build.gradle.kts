plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "net.dafric.cinematv"
    compileSdk = 35
    defaultConfig {
        applicationId = "net.dafric.cinematv"
        minSdk = 23
        targetSdk = 35
        versionCode = 21
        versionName = "2.1.0"
    }
    signingConfigs {
        create("release") {
            storeFile = file("../cinema-tv.keystore")
            storePassword = "cinematv"
            keyAlias = "cinematv"
            keyPassword = "cinematv"
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            /* the keystore is not in git: without it the release build is left unsigned instead of failing */
            if (file("../cinema-tv.keystore").exists()) signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17"; freeCompilerArgs += "-opt-in=androidx.media3.common.util.UnstableApi" }
}
dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("androidx.media3:media3-exoplayer:1.5.1")
    implementation("androidx.media3:media3-exoplayer-hls:1.5.1")
    implementation("androidx.media3:media3-ui:1.5.1")
    implementation("androidx.media3:media3-datasource:1.5.1")
    implementation("androidx.media3:media3-session:1.5.1")
    implementation("androidx.media3:media3-exoplayer-workmanager:1.5.1")
    implementation("androidx.work:work-runtime-ktx:2.9.1")
}
