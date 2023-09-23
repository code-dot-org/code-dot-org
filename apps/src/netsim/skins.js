import skinBase from '../skins';

function load(assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);
  return skin;
}
export default {
  load,
};
