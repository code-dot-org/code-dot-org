class Pegman {
  private x?: number;
  private y?: number;
  private direction?: number;
  private id: string;
  private isVisible: boolean;

  constructor(
    id: string,
    x?: number,
    y?: number,
    direction?: number,
    isVisible: boolean = true,
  ) {
    if (id === undefined || id === null) {
      throw new Error('Pegman id cannot be null or undefined');
    }

    this.x = x;
    this.y = y;
    this.direction = direction;
    this.id = id;
    this.isVisible = isVisible;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getDirection() {
    return this.direction;
  }

  getId() {
    return this.id;
  }

  getIsVisible() {
    return this.isVisible;
  }

  setX(x: number) {
    this.x = x;
  }

  setY(y: number) {
    this.y = y;
  }

  setDirection(direction: number) {
    this.direction = direction;
  }

  setIsVisible(isVisible: boolean) {
    this.isVisible = isVisible;
  }
}

export default Pegman;
