function makeNewBadGuysSprite(costume,location) {
  createNewSprite({name: 'temporarySprite'}, costume, location);
  var size;
  switch (costume) {
    case 'BADGUYS_3_wolf.png_1':
    case 'BADGUYS_4_wolf_sunglasses.png_1':
      size = 208 * 8 / 7;
      break;
    case 'BADGUYS_5_tarantula.png_1':
    case 'BADGUYS_6_tarantula_sunglasses.png_1':
      size = 29 * 8 / 7;
      break;
    case 'BADGUYS_7_shark.png_1':
    case 'BADGUYS_8_shark_sunglasses.png_1':
      size = 220 * 8 / 7;
      break;
    case 'BADGUYS_9_snake.png_1':
    case 'BADGUYS_10_snake_sunglasses.png_1':
      size = 141 * 8 / 7;
      break;
    case 'BADGUYS_11_pirahna.png_1':
    case 'BADGUYS_12_pirahna_sunglasses.png_1':
      size = 71 * 8 / 7;
      break;
    default:
      size = 100 * 8 / 7;
        break;
  }
  setProp({name: 'temporarySprite'}, "scale", size);
}