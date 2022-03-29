function makeNewScaledSprite(costume,location) {
  createNewSprite({name: 'temporarySprite'}, costume, location);
  var size;
  switch (costume) {
    case 'wolf':
    case 'wolf_sunglasses':
      size = 208 * 8 / 7;
      break;
    case 'tarantula':
    case 'tarantula_sunglasses':
      size = 29 * 8 / 7;
      break;
    case 'shark':
    case 'shark_sunglasses':
      size = 220 * 8 / 7;
      break;
    case 'snake':
    case 'snake_sunglasses':
      size = 141 * 8 / 7;
      break;
    case 'pirahna':
    case 'pirahna_sunglasses':
      size = 71 * 8 / 7;
      break;
    case 'car_group':
      size = 150;
      break;
    default:
      size = 100;
        break;
  }
  setProp({name: 'temporarySprite'}, "scale", size);
}