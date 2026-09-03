// MUI custom variants (Typography body3, Button extraSmall, ...) are
// declared by the component library's themes module and reach a program
// only when something in it imports that module. The dev shell does, but
// vite-plugin-dts excludes src/dev, so the gallery components would not
// type-check in the build without this reference.
import '@code-dot-org/component-library/themes';
