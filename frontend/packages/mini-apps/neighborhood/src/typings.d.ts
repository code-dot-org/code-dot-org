declare module '@code-dot-org/maze' {
  export const tiles: {
    Direction: {
      [key: string]: number;
    };
  };

  export class MazeController {
    constructor(level: object, skin: object, config: object, options: object);
    subtype: {
      initStartFinish(): void;
      createDrawer(svg: HTMLElement | null): void;
      initWallMap(): void;
      takePaint(id: number): void;
      addPaint(id: number, color?: string): void;
      removePaint(id: number): void;
      turnLeft(id: number): void;
      setBucketVisibility(visible: boolean): void;
    };
    initWithSvg(svg: HTMLElement | null): void;
    animatedMove(direction: number, time: number, id: number): void;
    addPegman(id: number, x: number, y: number, direction: number): void;
    showPegman(id?: number): void;
    hidePegman(id?: number): void;
    hideDefaultPegman(): void;
    reset(a: boolean, b: boolean): void;
  }
}
