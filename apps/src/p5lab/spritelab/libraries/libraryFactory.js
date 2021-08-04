import CoreLibrary from './CoreLibrary';
import PoemBotLibrary from './PoemBotLibrary';

export default function createLibrary(levelConfig, args) {
  if (!args.p5) {
    console.warn('cannot create sprite lab library without p5 instance');
    return;
  }
  if (levelConfig.blockPools?.includes('PoemBot')) {
    return new PoemBotLibrary(args.p5);
  } else {
    return new CoreLibrary(args.p5);
  }
}
