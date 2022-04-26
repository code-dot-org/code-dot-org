function makeNewBadGuysSprite(costume,location) {
  createNewSprite({name: 'newTheBadGuysSprite'}, costume, location);
  var size;
  switch (costume) {
    case 'wolf':
    case 'wolf_sunglasses':
      size = 240;
      break;
    case 'tarantula':
    case 'tarantula_sunglasses':
      size = 35;
      break;
    case 'shark':
    case 'shark_sunglasses':
      size = 283;
      break;
    case 'snake':
    case 'snake_sunglasses':
      size = 171;
      break;
    case 'pirahna':
    case 'pirahna_sunglasses':
      size = 79;
      break;
    case 'marmalade':
      size = 78;
      break;
    case 'foxington':
      size = 223;
      break;
    case 'luggins':
      size = 215;
      break;
    case 'fluffit':
      size = 217;
      break;
    case 'car_group':
      size = 300;
      break;
    default:
      size = 100;
        break;
  }
  setProp({name: 'newTheBadGuysSprite'}, "scale", size);
}