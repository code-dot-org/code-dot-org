import skinBase from '@cdo/apps/skins';

function load(assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);

  return skin;
}
export default {
  load,
};
