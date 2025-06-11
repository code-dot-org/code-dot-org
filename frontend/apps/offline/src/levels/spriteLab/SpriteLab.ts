/**
 * The options to use when instantiating a SpriteLab controller
 */
export interface SpriteLabOptions {
  /** Any custom API calls to add to the program runtime environment */
  api: object;
  /** The container for the canvas */
  container: HTMLElement;
}

class SpriteLab {
  constructor(_options: SpriteLabOptions) {}

  reset() {}

  run() {}

  evaluate(code: string) {
    console.log('CODE', code);
  }
}

export default SpriteLab;
