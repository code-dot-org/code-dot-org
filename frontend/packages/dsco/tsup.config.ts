import {defineConfig} from "tsup";
import {postcssModules, sassPlugin} from 'esbuild-sass-plugin';
import {glob} from "glob";
import {resolve} from "node:path"

const entryPoints = glob.sync('./components/**/index.ts', {
    posix: true,
})

export default defineConfig({
    entry: entryPoints,
    clean: true,
    target: "es2019",
    format: ["cjs", "esm"],
    banner: {js: '"use client";'},
    external: ['/fonts/barlowSemiCondensed/BarlowSemiCondensed-Medium.ttf', '/fonts/barlowSemiCondensed/BarlowSemiCondensed-SemiBold.ttf'],
    esbuildPlugins: [
        sassPlugin({
            type: 'style',
            filter: /\.module\.scss$/,
            loadPaths: ["@code-dot-org/css-poc"],
            transform: postcssModules({
                generateScopedName: '[name]__[local]___[hash:base64:5]',
            }),
            importMapper: (path) => {
                // Convert any references to @ to the ./components directory
                return resolve(__dirname, path.replace(/^@\//, './components/'));
            }
        })

    ]
});
