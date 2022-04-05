function setSize_dropdown(sprite, scale) {
  var size;
  switch (sprite.costume) {
    case 'wolf':
    case 'wolf_sunglasses':
      size = 240 * scale;
      break;
    case 'tarantula':
    case 'tarantula_sunglasses':
      size = 35 * scale;
      break;
    case 'shark':
    case 'shark_sunglasses':
      size = 283 * scale;
      break;
    case 'snake':
    case 'snake_sunglasses':
      size = 171 * scale;
      break;
    case 'pirahna':
    case 'pirahna_sunglasses':
      size = 79 * scale;
      break;
    case 'marmalade':
      size = 78 * scale;
      break;
    case 'foxington':
      size = 223 * scale;
      break;
    case 'luggins':
      size = 215 * scale;
      break;
    case 'fluffit':
      size = 217 * scale;
      break;
    case 'car_group':
      size = 150 * scale;
      break;
    default:
      size = 100 * scale;
        break;
  }
  setProp(sprite, "scale", size);
}