import {parseModule} from 'magicast';

/**
 * Takes a dynamic base CSFv3 within a 'dynamicStory' and compiles it into live code
 *
 * More information: https://storybook.js.org/docs/api/main-config-indexers/#transpiling-to-csf
 */
export const compile = async config => {
  const {baseCsf} = config;
  const stories = await config.stories();

  const mod = parseModule(baseCsf);
  Object.entries(stories).forEach(([key, story]) => {
    mod.exports[key] = story;
  });

  const {code} = mod.generate();

  return code;
};
