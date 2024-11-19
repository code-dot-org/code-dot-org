import { join, dirname, resolve } from "node:path";
import {StorybookConfig} from "@storybook/react-webpack5";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: [
    "../../../packages/dsco/components/**/*.story.@(ts|tsx)"
  ],
  addons: [
    getAbsolutePath("@storybook/addon-webpack5-compiler-swc"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    {
      name: getAbsolutePath("@storybook/addon-styling-webpack"),
      options: {
        rules: [
          {
            test: /\.s[ac]ss$/i,
            use: [
              "style-loader",
              {
                loader: 'css-loader',
                options: {
                  url: false,
                  // https://webpack.js.org/loaders/css-loader/#importloaders
                  // // 2 => style-loader, sass-loader
                  importLoaders: 2
                },
              },
              {
                loader: "sass-loader",
                options: { implementation: require.resolve("sass"),
                  api: 'legacy',
                  sassOptions: {
                    outputStyle: 'compressed',
                  }}
              },
            ],
          },
        ]
      }
    }
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {},
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': resolve(__dirname, "../../../packages/dsco/components")
      };
    }


    return config;
  },
};
export default config;
