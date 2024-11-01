import {get} from 'js-cookie';

export const getGlobalEditionRegion = () => {
  const geRegionScript = document.querySelector(
    'script[data-ge-region]'
  ) as HTMLScriptElement;

  const geRegion = geRegionScript
    ? geRegionScript.dataset.geRegion
    : get('ge_region');

  return geRegion || null;
};
