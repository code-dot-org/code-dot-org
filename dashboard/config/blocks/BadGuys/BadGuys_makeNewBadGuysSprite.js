function makeNewBadGuysSprite(costume,location) {
  createNewSprite({name: 'newTheBadGuysSprite'}, costume, location);
  var size;
  switch (costume) {
    case 'wolf':
    case 'wolf_sunglasses':
      size = 208;
      break;
    case 'tarantula':
    case 'tarantula_sunglasses':
      size = 29;
      break;
    case 'shark':
    case 'shark_sunglasses':
      size = 220;
      break;
    case 'snake':
    case 'snake_sunglasses':
      size = 141;
      break;
    case 'pirahna':
    case 'pirahna_sunglasses':
      size = 71;
      break;
    case 'car_group':
      size = 150;
      break;
    default:
      size = 100;
        break;
  }
  setProp({name: 'newTheBadGuysSprite'}, "scale", size);
}