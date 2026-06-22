import * as timeoutList from '@cdo/apps/lib/util/timeoutList';

import {
  ASSIGN_ANIMATION_MS,
  CENTROID_MOVE_ANIMATION_MS,
  KMeansSignalType,
  MAX_ITERATIONS,
  SIGNAL_CHECK_TIME,
  STEP_PAUSE_MS,
} from './constants';
import {Centroid, KMeansCallbacks, KMeansSignal, Point} from './types';

export default class KMeans {
  private callbacks: KMeansCallbacks;

  // Signal queue (from Python)
  private signals: KMeansSignal[];
  private nextSignalIndex: number;
  private isProcessingSignals: boolean;
  private resolveOnDone?: () => void;
  private donePromise: Promise<void> | null;

  // Algorithm state
  private points: Point[];
  private centroids: Centroid[];
  private assignments: Map<number, number>;
  private k: number;
  private isReady: boolean;
  private isConverged: boolean;
  private isAnimating: boolean;
  private isPlayRunning: boolean;

  constructor(callbacks: KMeansCallbacks) {
    this.callbacks = callbacks;
    this.signals = [];
    this.nextSignalIndex = 0;
    this.isProcessingSignals = false;
    this.donePromise = null;
    this.points = [];
    this.centroids = [];
    this.assignments = new Map();
    this.k = 0;
    this.isReady = false;
    this.isConverged = false;
    this.isAnimating = false;
    this.isPlayRunning = false;
  }

  // ── Signal queue (Python → JS) ──────────────────────────────────────────

  handleSignal(signal: KMeansSignal | null) {
    if (!signal) return;
    this.signals.push(signal);
  }

  processSignals() {
    if (this.signals.length > this.nextSignalIndex) {
      const signal = this.signals[this.nextSignalIndex];

      if (signal.value === KMeansSignalType.DONE) {
        this.callbacks.setIsRunning(false);
        if (this.resolveOnDone) {
          this.resolveOnDone();
        }
        return;
      }

      this.applySignal(signal);
      this.nextSignalIndex++;
      timeoutList.setTimeout(() => this.processSignals(), 0);
    } else {
      timeoutList.setTimeout(() => this.processSignals(), SIGNAL_CHECK_TIME);
    }
  }

  private applySignal(signal: KMeansSignal) {
    switch (signal.value) {
      case KMeansSignalType.ADD_POINT: {
        const {x, y, id} = signal.detail!;
        const point: Point = {x: x!, y: y!, id: id!};
        this.points.push(point);
        this.callbacks.onAddPoint(point);
        break;
      }
      case KMeansSignalType.READY: {
        const {k} = signal.detail!;
        this.k = k!;
        this.isReady = true;
        this.callbacks.onReady(k!);
        break;
      }
    }
  }

  // ── Algorithm (JS-side, triggered by canvas buttons) ───────────────────

  initialize() {
    if (!this.isReady || this.points.length < this.k || this.isAnimating) {
      return;
    }

    // Cancel any in-flight play
    this.isPlayRunning = false;
    timeoutList.clearTimeouts();
    this.isAnimating = false;

    // Reset state, keep points
    this.centroids = [];
    this.assignments = new Map();
    this.isConverged = false;

    // Random sample of k points as initial centroids
    const shuffled = [...this.points].sort(() => Math.random() - 0.5);
    this.centroids = shuffled
      .slice(0, this.k)
      .map((p, i) => ({id: i, x: p.x, y: p.y}));

    this.callbacks.onCentroidsInitialized([...this.centroids]);
    this.callbacks.onAssigned([]); // clear any previous assignments

    // Restart signal processing (clearTimeouts cancelled it)
    if (this.isProcessingSignals) {
      timeoutList.setTimeout(() => this.processSignals(), SIGNAL_CHECK_TIME);
    }
  }

  step() {
    if (
      !this.isReady ||
      this.centroids.length === 0 ||
      this.isConverged ||
      this.isAnimating ||
      this.isPlayRunning
    ) {
      return;
    }
    this._executeStep(() => {});
  }

  play() {
    if (
      !this.isReady ||
      this.centroids.length === 0 ||
      this.isConverged ||
      this.isAnimating ||
      this.isPlayRunning
    ) {
      return;
    }
    this.isPlayRunning = true;
    this._playStep(0);
  }

  private _playStep(iteration: number) {
    if (
      !this.isPlayRunning ||
      this.isConverged ||
      iteration >= MAX_ITERATIONS
    ) {
      this.isPlayRunning = false;
      return;
    }

    this._executeStep(() => {
      if (!this.isPlayRunning || this.isConverged) {
        this.isPlayRunning = false;
        return;
      }
      timeoutList.setTimeout(
        () => this._playStep(iteration + 1),
        STEP_PAUSE_MS
      );
    });
  }

  private _executeStep(onComplete: () => void) {
    this.isAnimating = true;
    this.callbacks.onAnimationStart();

    // 1. Assignment: each point → nearest centroid
    const newAssignments = new Map<number, number>();
    for (const point of this.points) {
      let nearestId = 0;
      let minDist = Infinity;
      for (const centroid of this.centroids) {
        const dist = Math.hypot(point.x - centroid.x, point.y - centroid.y);
        if (dist < minDist) {
          minDist = dist;
          nearestId = centroid.id;
        }
      }
      newAssignments.set(point.id, nearestId);
    }
    this.assignments = newAssignments;
    this.callbacks.onAssigned(
      [...newAssignments.entries()].map(([k, v]) => [k, v])
    );

    // 2. Update: recompute centroids after assignment animation
    timeoutList.setTimeout(() => {
      const newCentroids: Centroid[] = this.centroids.map(centroid => {
        const clusterPoints = this.points.filter(
          p => this.assignments.get(p.id) === centroid.id
        );
        if (clusterPoints.length === 0) return centroid;
        const meanX =
          clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
        const meanY =
          clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
        return {id: centroid.id, x: meanX, y: meanY};
      });

      const converged = newCentroids.every(
        (c, i) =>
          Math.abs(c.x - this.centroids[i].x) < 0.0001 &&
          Math.abs(c.y - this.centroids[i].y) < 0.0001
      );

      this.centroids = newCentroids;
      this.callbacks.onCentroidsUpdated([...newCentroids]);

      // 3. After centroid slide animation, check convergence
      timeoutList.setTimeout(() => {
        this.isAnimating = false;
        this.callbacks.onAnimationEnd();
        if (converged) {
          this.isConverged = true;
          this.isPlayRunning = false;
          this.callbacks.onConverged();
        }
        onComplete();
      }, CENTROID_MOVE_ANIMATION_MS);
    }, ASSIGN_ANIMATION_MS);
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  onRun() {
    this.isProcessingSignals = true;
    this.callbacks.setIsRunning(true);
    timeoutList.setTimeout(() => this.processSignals(), SIGNAL_CHECK_TIME);
  }

  onStop() {
    timeoutList.clearTimeouts();
    this.isPlayRunning = false;
    this.isAnimating = false;
    this.resetSignalQueue();
  }

  onClose() {
    // Inject DONE so the signal loop terminates cleanly
    this.signals.push({value: KMeansSignalType.DONE});
  }

  reset() {
    timeoutList.clearTimeouts();
    this.isPlayRunning = false;
    this.isAnimating = false;
    this.resetSignalQueue();
    this.points = [];
    this.centroids = [];
    this.assignments = new Map();
    this.k = 0;
    this.isReady = false;
    this.isConverged = false;
    this.callbacks.onReset();
  }

  private resetSignalQueue() {
    this.signals = [];
    this.nextSignalIndex = 0;
    this.isProcessingSignals = false;
  }

  isRunning() {
    return this.isProcessingSignals;
  }

  waitUntilDone(): Promise<void> {
    if (!this.isRunning()) {
      return Promise.resolve();
    }
    if (this.donePromise) {
      return this.donePromise;
    }
    this.donePromise = new Promise(resolve => {
      this.resolveOnDone = () => {
        resolve();
        this.donePromise = null;
        this.resolveOnDone = undefined;
      };
    });
    return this.donePromise;
  }
}
