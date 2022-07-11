function setSize_dropdown(sprite, scale) {
  switch (sprite.costume) {
    case 'all':
      setProp({costume: "all"}, "scale", 100 * scale);
      setProp({costume: "wolf"}, "scale", 240 * scale);
      setProp({costume: "wolf_sunglasses"}, "scale", 240 * scale);
      setProp({costume: "tarantula"}, "scale", 35 * scale);
      setProp({costume: "tarantula_sunglasses"}, "scale", 35 * scale);
      setProp({costume: "shark"}, "scale", 283 * scale);
      setProp({costume: "shark_sunglasses"}, "scale", 283 * scale);
      setProp({costume: "snake"}, "scale", 171 * scale);
      setProp({costume: "snake_sunglasses"}, "scale", 171 * scale);
      setProp({costume: "pirahna"}, "scale", 79 * scale);
      setProp({costume: "pirahna_sunglasses"}, "scale", 79 * scale);
      setProp({costume: "marmalade"}, "scale", 78 * scale);
      setProp({costume: "foxington"}, "scale", 223 * scale);
      setProp({costume: "luggins"}, "scale", 215 * scale);
      setProp({costume: "fluffit"}, "scale", 217 * scale);
      setProp({costume: "car_group"}, "scale", 300 * scale);
      break;
    case 'wolf':
    case 'wolf_sunglasses':
      setProp({costume: "wolf"}, "scale", 240 * scale);
      setProp({costume: "wolf_sunglasses"}, "scale", 240 * scale);
      break;
    case 'tarantula':
    case 'tarantula_sunglasses':
      setProp({costume: "tarantula"}, "scale", 35 * scale);
      setProp({costume: "tarantula_sunglasses"}, "scale", 35 * scale);
      break;
    case 'shark':
    case 'shark_sunglasses':
      setProp({costume: "shark"}, "scale", 283 * scale);
      setProp({costume: "shark_sunglasses"}, "scale", 283 * scale);
      break;
    case 'snake':
    case 'snake_sunglasses':
      setProp({costume: "snake"}, "scale", 171 * scale);
      setProp({costume: "snake_sunglasses"}, "scale", 171 * scale);
      break;
    case 'pirahna':
    case 'pirahna_sunglasses':
      setProp({costume: "pirahna"}, "scale", 79 * scale);
      setProp({costume: "pirahna_sunglasses"}, "scale", 79 * scale);
      break;
    case 'marmalade':
      setProp(sprite, "scale", 78 * scale);
      break;
    case 'foxington':
      setProp(sprite, "scale", 223 * scale);
      break;
    case 'luggins':
      setProp(sprite, "scale", 215 * scale);
      break;
    case 'fluffit':
      setProp(sprite, "scale", 217 * scale);
      break;
    case 'car_group':
      setProp(sprite, "scale", 300 * scale);
      break;
    default:
      setProp(sprite, "scale", 100 * scale);
      break;
  }
}