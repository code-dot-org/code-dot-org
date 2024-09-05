import currentBrandRegion from '@cdo/apps/util/currentBrandRegion';
import {BrandRegionFeatureExclusionMap} from '@cdo/generated-scripts/sharedBrandRegionFeatureExclusionMap';

export default (feature: string) => {
  // Split by '.' and then tap into the object
  const parts = feature.split('.');
  let ret = false;
  let context: any = (BrandRegionFeatureExclusionMap as { [key: string]: { [key: string]: { [key: string]: any }}})[currentBrandRegion()] || {};
  for (const part of parts) {
    if (context[part] === false) {
      context = false;
      break;
    }
    context = context[part] || {};
  }

  if (context !== false && Object.keys(context).length === 0) {
    context = true;
  }

  return !!context;
}
