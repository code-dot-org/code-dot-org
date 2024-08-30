/**
 * Class for managing and rendering an angle picker UI component.
 *
 * This class is designed to add an interactive angle picker UI to block fields within the Artist lab.
 * It provides functionality for:
 *
 * - Initializing and configuring the angle picker UI, including its appearance and behavior.
 * - Handling user interactions, such as dragging to adjust the angle and rotating the background.
 * - Updating the visual representation of the angle picker, including drawing lines, circles, and tick marks.
 * - Animating angle changes when a new value is set (via text input or dropdown menu option selection).
 */

import * as Blockly from 'blockly/core';

import color from '@cdo/apps/util/color';

import {CLOCKWISE_TURN_DIRECTION} from '../constants';

import {Vector} from './vector';

interface AngleHelperOptions {
  arcColour?: string;
  angle?: number;
  height?: number;
  width?: number;
  snapPoints?: number[];
  onUpdate?: () => void;
  enableBackgroundRotation?: boolean;
}

class CdoAngleHelper {
  private lineColour_: string;
  private strokeWidth_: number;
  private arcColour_: string;
  private height_: number;
  public width_: number;
  private snapPoints_?: number[];
  private onUpdate_?: () => void;
  private enableBackgroundRotation_: boolean;
  private turnRight_: boolean;
  private picker_: {
    handleRadius: number;
    isDragging: boolean;
    angle: number;
    line: SVGLineElement | null;
    handle: SVGCircleElement | null;
    handleCenter?: Vector;
  };
  private background_: {
    handleRadius: number;
    tickSpacing: number;
    isDragging: boolean;
    angle: number;
    handle: SVGCircleElement | null;
    line: SVGLineElement | null;
    ticks: SVGLineElement[];
    handleCenter?: Vector;
  };
  private radius_: Vector;
  private center_: Vector;
  private arc_: SVGPathElement | null;
  public svg_: SVGSVGElement | null;
  private rect_: DOMRect | null;
  private animationInterval_: number | undefined;
  private mouseMoveWrapper_: ((e: MouseEvent) => void) | null;
  private mouseUpWrapper_: ((e: MouseEvent) => void) | null;
  private mouseDownWrapper_: ((e: MouseEvent) => void) | null;

  constructor(direction: string, options: AngleHelperOptions = {}) {
    this.lineColour_ = color.dark_charcoal;
    this.strokeWidth_ = 3;
    this.arcColour_ = options.arcColour || this.lineColour_;
    this.height_ = options.height || 150;
    this.width_ = options.width || 150;
    this.snapPoints_ = options.snapPoints?.map(point => Math.round(point));
    this.onUpdate_ = options.onUpdate;
    this.enableBackgroundRotation_ = options.enableBackgroundRotation || false;

    this.turnRight_ = direction === CLOCKWISE_TURN_DIRECTION;

    this.picker_ = {
      handleRadius: 10,
      isDragging: false,
      angle: options.angle || 0,
      line: null,
      handle: null,
      handleCenter: undefined,
    };

    this.background_ = {
      handleRadius: 5,
      tickSpacing: 15,
      isDragging: false,
      angle: 0,
      handle: null,
      line: null,
      ticks: [],
      handleCenter: undefined,
    };

    this.radius_ = new Vector(
      Math.min(this.height_, this.width_) / 2 -
        this.picker_.handleRadius -
        this.strokeWidth_,
      0
    );
    this.center_ = new Vector(this.width_ / 2, this.height_ / 2);

    if (this.enableBackgroundRotation_) {
      this.picker_.handleCenter = this.center_
        .clone()
        .add(new Vector(this.radius_.x - this.picker_.handleRadius, 0));
    } else {
      this.picker_.handleCenter = this.center_.clone().add(this.radius_);
    }
    this.picker_.handleCenter = Vector.rotateAroundPoint(
      this.picker_.handleCenter,
      this.center_,
      this.turnRight_ ? this.picker_.angle : -this.picker_.angle
    );

    this.background_.handleCenter = this.center_
      .clone()
      .add(new Vector(this.radius_.x + this.background_.handleRadius, 0));

    this.arc_ = null;
    this.svg_ = null;
    this.rect_ = null;
    this.animationInterval_ = undefined;
    this.mouseMoveWrapper_ = null;
    this.mouseUpWrapper_ = null;
    this.mouseDownWrapper_ = null;
  }

  animateAngleChange(
    targetAngle: number,
    animationDuration: number = 200
  ): void {
    const minSteps = animationDuration / 10;
    const totalDiff = targetAngle - this.getAngle();
    const steps = Math.min(Math.abs(totalDiff), minSteps);
    const timePerStep = animationDuration / steps;
    const diffPerStep = totalDiff / steps;

    clearInterval(this.animationInterval_);
    this.animationInterval_ = window.setInterval(() => {
      if (Math.abs(this.getAngle() - targetAngle) < 1) {
        this.setAngle(targetAngle);
        clearInterval(this.animationInterval_);
      } else {
        const newAngle = this.getAngle() + diffPerStep;
        this.setAngle(newAngle, true);
      }
    }, timePerStep);
  }

  setAngle(angle: number, skipSnap: boolean = false): void {
    this.picker_.angle = skipSnap ? angle : this.snap_(angle);
    this.update_();
  }

  getAngle(): number {
    return this.picker_.angle;
  }

  init(svgContainer: HTMLElement): void {
    // Create the SVG container for the angle helper
    this.svg_ = Blockly.utils.dom.createSvgElement(
      'svg',
      {
        version: '1.1',
        height: `${this.height_}px`,
        width: `${this.width_}px`,
        style: 'background: rgb(255, 255, 255);',
      },
      svgContainer
    ) as SVGSVGElement;
    this.rect_ = this.svg_.getBoundingClientRect();
    this.mouseMoveWrapper_ = this.updateDrag_.bind(this);
    this.mouseUpWrapper_ = this.stopDrag_.bind(this);
    this.mouseDownWrapper_ = this.startDrag_.bind(this);

    this.svg_.addEventListener(
      'mousemove',
      this.mouseMoveWrapper_ as EventListener
    );
    this.svg_.addEventListener(
      'mouseup',
      this.mouseUpWrapper_ as EventListener
    );
    this.svg_.addEventListener(
      'mousedown',
      this.mouseDownWrapper_ as EventListener
    );

    this.background_.line = Blockly.utils.dom.createSvgElement(
      'line',
      {
        stroke: this.lineColour_,
        'stroke-width': this.strokeWidth_,
        'stroke-linecap': 'round',
        'stroke-dasharray': '6 6',
        'stroke-opacity': '0.5',
        x1: this.center_.x - this.radius_.x,
        x2: this.center_.x + this.radius_.x,
        y1: this.center_.y,
        y2: this.center_.y,
      },
      this.svg_
    ) as SVGLineElement;

    if (this.enableBackgroundRotation_) {
      this.background_.handle = Blockly.utils.dom.createSvgElement(
        'circle',
        {
          cx: this.background_.handleCenter!.x,
          cy: this.background_.handleCenter!.y,
          fill: this.lineColour_,
          stroke: this.lineColour_,
          'stroke-width': 1,
          r: this.background_.handleRadius,
          style: 'cursor: pointer;',
        },
        this.svg_
      ) as SVGCircleElement;
    }

    this.arc_ = Blockly.utils.dom.createSvgElement(
      'path',
      {
        stroke: this.arcColour_,
        fill: this.arcColour_,
        'fill-opacity': '0.3',
        'stroke-width': this.strokeWidth_,
      },
      this.svg_
    ) as SVGPathElement;

    // Create tick marks around the circumference of the angle helper.
    for (let angle = 0; angle < 360; angle += this.background_.tickSpacing) {
      let markerSize;
      // Determine the size of the tick mark based on the angle.
      if (angle % 90 === 0) {
        // Large tick mark for 0, 90, 180, and 270 degrees.
        markerSize = 15;
      } else if (angle % 45 === 0) {
        // Medium tick mark for 45, 135, 225, and 315 degrees.
        markerSize = 10;
      } else {
        // Small tick mark for all other angles.
        markerSize = 5;
      }
      this.background_.ticks.push(
        Blockly.utils.dom.createSvgElement(
          'line',
          {
            'stroke-linecap': 'round',
            'stroke-opacity': 0.3,
            stroke: this.lineColour_,
            x1: this.center_.x + this.radius_.x,
            y1: this.center_.y,
            x2: this.center_.x + this.radius_.x - markerSize,
            y2: this.center_.y,
            class: 'blocklyAngleMarks',
            transform: `rotate(${angle}, ${this.center_.x}, ${this.center_.y})`,
          },
          this.svg_
        ) as SVGLineElement
      );
    }

    this.picker_.line = Blockly.utils.dom.createSvgElement(
      'line',
      {
        stroke: this.lineColour_,
        'stroke-width': this.strokeWidth_,
        'stroke-linecap': 'round',
        x1: this.center_.x,
        x2: this.picker_.handleCenter!.x,
        y1: this.center_.y,
        y2: this.picker_.handleCenter!.y,
      },
      this.svg_
    ) as SVGLineElement;

    this.picker_.handle = Blockly.utils.dom.createSvgElement(
      'circle',
      {
        cx: this.picker_.handleCenter!.x,
        cy: this.picker_.handleCenter!.y,
        fill: color.light_purple,
        r: this.picker_.handleRadius,
        stroke: this.lineColour_,
        'stroke-width': this.strokeWidth_,
        style: 'cursor: pointer;',
      },
      this.svg_
    ) as SVGCircleElement;

    this.update_();
  }

  private update_(): void {
    if (this.enableBackgroundRotation_) {
      this.background_.line!.setAttribute(
        'transform',
        `rotate(${this.background_.angle}, ${this.center_.x}, ${this.center_.y})`
      );
      for (let i = 0; i < this.background_.ticks.length; i++) {
        const angle =
          (this.background_.tickSpacing * i + this.background_.angle) % 360;
        this.background_.ticks[i].setAttribute(
          'transform',
          `rotate(${angle}, ${this.center_.x}, ${this.center_.y})`
        );
      }
      this.picker_.handleCenter = this.center_
        .clone()
        .add(new Vector(this.radius_.x - this.picker_.handleRadius, 0));
    } else {
      this.picker_.handleCenter = this.center_.clone().add(this.radius_);
    }
    this.picker_.handleCenter = Vector.rotateAroundPoint(
      this.picker_.handleCenter,
      this.center_,
      this.background_.angle +
        (this.turnRight_ ? this.picker_.angle : -this.picker_.angle)
    );

    this.picker_.line!.setAttribute(
      'x2',
      this.picker_.handleCenter.x.toString()
    );
    this.picker_.line!.setAttribute(
      'y2',
      this.picker_.handleCenter.y.toString()
    );

    this.picker_.handle!.setAttribute(
      'cx',
      this.picker_.handleCenter.x.toString()
    );
    this.picker_.handle!.setAttribute(
      'cy',
      this.picker_.handleCenter.y.toString()
    );

    if (this.enableBackgroundRotation_) {
      this.background_.handleCenter = Vector.rotateAroundPoint(
        this.center_
          .clone()
          .add(new Vector(this.radius_.x + this.background_.handleRadius, 0)),
        this.center_,
        this.background_.angle
      );
      this.background_.handle!.setAttribute(
        'cx',
        this.background_.handleCenter.x.toString()
      );
      this.background_.handle!.setAttribute(
        'cy',
        this.background_.handleCenter.y.toString()
      );
    }

    const arcStart = this.background_.angle;
    const arcEnd =
      this.background_.angle +
      (this.turnRight_ ? this.picker_.angle : -this.picker_.angle);
    this.arc_!.setAttribute(
      'd',
      CdoAngleHelper.describeArc(this.center_, 20, arcStart, arcEnd)
    );
  }

  private startDrag_(e: MouseEvent): void {
    const x = e.clientX - this.rect_!.left;
    const y = e.clientY - this.rect_!.top;
    const mouseLocation = new Vector(x, y);
    if (
      this.enableBackgroundRotation_ &&
      Vector.distance(this.background_.handleCenter!, mouseLocation) <
        this.background_.handleRadius
    ) {
      this.background_.isDragging = true;
    } else {
      this.picker_.isDragging = true;
    }
  }

  private updateDrag_(e: MouseEvent): void {
    const x = e.clientX - this.rect_!.left;
    const y = e.clientY - this.rect_!.top;
    let angle = this.calculateAngle(this.center_.x, this.center_.y, x, y);
    if (this.picker_.isDragging) {
      angle = this.standardAngle(angle - this.background_.angle);
      if (!this.turnRight_) {
        angle = this.standardAngle(-angle);
      }
      this.setAngle(angle);
      if (this.onUpdate_) {
        this.onUpdate_();
      }
    }
    if (this.background_.isDragging) {
      this.background_.angle = angle;
      this.update_();
    }

    e.stopPropagation();
    e.preventDefault();
  }

  private stopDrag_(): void {
    this.picker_.isDragging = false;
    this.background_.isDragging = false;
  }

  private snap_(val: number): number {
    if (!this.snapPoints_) {
      return Math.round(val);
    }

    return this.snapPoints_.reduce((prev, curr) => {
      const currDiff = Math.abs(this.angleDifference(curr, val));
      const prevDiff = Math.abs(this.angleDifference(prev, val));
      return currDiff < prevDiff ? curr : prev;
    });
  }

  dispose(): void {
    if (this.mouseDownWrapper_) {
      this.svg_!.removeEventListener(
        'mousedown',
        this.mouseDownWrapper_ as EventListener
      );
      this.mouseDownWrapper_ = null;
    }
    if (this.mouseUpWrapper_) {
      this.svg_!.removeEventListener(
        'mouseup',
        this.mouseUpWrapper_ as EventListener
      );
      this.mouseUpWrapper_ = null;
    }
    if (this.mouseMoveWrapper_) {
      this.svg_!.removeEventListener(
        'mousemove',
        this.mouseMoveWrapper_ as EventListener
      );
      this.mouseMoveWrapper_ = null;
    }
    this.svg_!.remove();
    this.arc_ = null;
    this.picker_.line = null;
    this.picker_.handle = null;
    this.background_.line = null;
    this.background_.handle = null;
    this.background_.ticks = [];
    this.svg_ = null;
  }

  static describeArc(
    center: Vector,
    radius: number,
    startAngle: number,
    endAngle: number
  ): string {
    // Normalize endAngle to ensure it's within 360º of startAngle, to prevent visual glitches.
    // Examples:
    // - If startAngle = 0 and endAngle = 450, the result will be startAngle = 0 and endAngle = 90.
    // - If startAngle = 270 and endAngle = 360, the result will be unchanged (startAngle = 270 and endAngle = 360).
    endAngle = ((endAngle - startAngle) % 360) + startAngle;
    const vector = center.clone().add(new Vector(radius, 0));
    const start = Vector.rotateAroundPoint(vector, center, startAngle);
    const end = Vector.rotateAroundPoint(vector, center, endAngle);

    const largeArcFlag = Math.abs(startAngle - endAngle) > 180 ? '1' : '0';
    const sweepFlag = endAngle - startAngle < 0 ? '0' : '1';

    const pathData = [
      'M',
      start.x.toFixed(2),
      start.y.toFixed(2),
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      sweepFlag,
      end.x.toFixed(2),
      end.y.toFixed(2),
      'L',
      center.x,
      center.y,
    ].join(' ');

    return pathData;
  }

  private calculateAngle(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle;
  }

  private standardAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }

  private angleDifference(angle1: number, angle2: number): number {
    const diff = angle1 - angle2;
    return ((diff + 180) % 360) - 180;
  }
}

export default CdoAngleHelper;
