import CoreLibrary from './CoreLibrary';
import PoemBotLibrary from './PoemBotLibrary';

export default function getLibrary(levelConfig, p5) {
  if (levelConfig.blockPools.includes('PoemBot')) {
    return new PoemBotLibrary(p5);
  } else {
    return new CoreLibrary(p5);
  }
}
