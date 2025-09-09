// A small singleton to share the speed slider value
// between NeighborhoodVisualization and Neighborhood.
export default class NeighborhoodSpeedTracker {
  private currentSpeed: number;

  private static _instance: NeighborhoodSpeedTracker;
  constructor() {
    this.currentSpeed = 50;
  }

  public static getInstance(): NeighborhoodSpeedTracker {
    if (NeighborhoodSpeedTracker._instance === undefined) {
      NeighborhoodSpeedTracker.create();
    }
    return NeighborhoodSpeedTracker._instance;
  }

  public static create() {
    NeighborhoodSpeedTracker._instance = new NeighborhoodSpeedTracker();
  }

  public setSpeed(speed: number) {
    this.currentSpeed = speed;
  }

  public getSpeed() {
    return this.currentSpeed;
  }
}
