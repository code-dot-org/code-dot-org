# CodeAI Android app

The app for Amazon Fire tablets (Amazon Kids+). The native code is Kotlin,
in `app/src/main/kotlin`.

Building needs JDK 21 and the Android SDK with platform 36:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export ANDROID_HOME=~/Library/Android/sdk
```

From the parent directory, build the landing page and copy it into this
project, or open the project in Android Studio:

```bash
yarn android:sync
yarn android:open
```

From this directory:

```bash
./gradlew assembleDebug       # app/build/outputs/apk/debug/codeai-<version>-debug.apk
./gradlew assembleRelease     # app/build/outputs/apk/release/CodeAI - Amazon Kids+ Edition.apk, unsigned
./gradlew testDebugUnitTest   # unit tests, on the JVM
```

To install the debug build on a tablet or emulator:

```bash
adb install -r app/build/outputs/apk/debug/codeai-1.0.0-debug.apk
```
