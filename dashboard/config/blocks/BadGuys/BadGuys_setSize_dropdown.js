function setSize_dropdown(sprite, scale) {
  var size;
  switch (sprite.costume) {
    case 'wolf':
    case 'wolf_sunglasses':
      size = 208 * scale / 100;
      break;
    case 'tarantula':
    case 'tarantula_sunglasses':
      size = 29 * scale / 100;
      break;
    case 'shark':
    case 'shark_sunglasses':
      size = 220 * scale / 100;
      break;
    case 'snake':
    case 'snake_sunglasses':
      size = 141 * scale / 100;
      break;
    case 'pirahna':
    case 'pirahna_sunglasses':
      size = 71 * scale / 100;
      break;
    case 'car_group':
      size = 150 * scale / 100;
      break;
    default:
      size = scale;
        break;
  }
  setProp(sprite, "scale", size);
}