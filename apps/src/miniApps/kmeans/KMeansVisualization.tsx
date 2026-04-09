import React from 'react';

import {
  ASSIGN_ANIMATION_MS,
  CENTROID_MOVE_ANIMATION_MS,
  CENTROID_SIZE,
  CLUSTER_COLORS,
  POINT_RADIUS,
  UNASSIGNED_COLOR,
} from './constants';
import moduleStyles from './kmeans.module.scss';
import {Centroid, KMeansVisualizationState, Point} from './types';

interface KMeansVisualizationProps {
  state: KMeansVisualizationState;
  onInitialize: () => void;
  onStep: () => void;
  onPlay: () => void;
}

const SVG_SIZE = 380;
const PADDING = 28;

function computeBounds(points: Point[]) {
  if (points.length === 0) {
    return {xMin: -1, xMax: 1, yMin: -1, yMax: 1};
  }
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const dataXMin = Math.min(...xs);
  const dataXMax = Math.max(...xs);
  const dataYMin = Math.min(...ys);
  const dataYMax = Math.max(...ys);

  const xRange = dataXMax - dataXMin || 1;
  const yRange = dataYMax - dataYMin || 1;
  const padX = xRange * 0.15;
  const padY = yRange * 0.15;

  return {
    xMin: dataXMin - padX,
    xMax: dataXMax + padX,
    yMin: dataYMin - padY,
    yMax: dataYMax + padY,
  };
}

function makeScalers(bounds: ReturnType<typeof computeBounds>) {
  const {xMin, xMax, yMin, yMax} = bounds;
  const plotW = SVG_SIZE - 2 * PADDING;
  const plotH = SVG_SIZE - 2 * PADDING;

  const toSvgX = (x: number) => PADDING + ((x - xMin) / (xMax - xMin)) * plotW;
  // SVG y-axis is inverted vs. mathematical y-axis
  const toSvgY = (y: number) =>
    SVG_SIZE - PADDING - ((y - yMin) / (yMax - yMin)) * plotH;

  return {toSvgX, toSvgY};
}

function diamondPoints(size: number): string {
  return `0,${-size} ${size},0 0,${size} ${-size},0`;
}

const KMeansVisualization: React.FunctionComponent<
  KMeansVisualizationProps
> = ({state, onInitialize, onStep, onPlay}) => {
  const {
    points,
    centroids,
    assignments,
    converged,
    iteration,
    isReady,
    isAnimating,
  } = state;

  const bounds = computeBounds(points);
  const {toSvgX, toSvgY} = makeScalers(bounds);

  const canInitialize = isReady && !isAnimating;
  const canStep =
    isReady && centroids.length > 0 && !converged && !isAnimating;
  const canPlay = canStep;

  return (
    <div className={moduleStyles.container}>
      {/* Control bar */}
      <div className={moduleStyles.controls}>
        <button
          className={moduleStyles.controlButton}
          onClick={onInitialize}
          disabled={!canInitialize}
        >
          Initialize Centroids
        </button>
        <button
          className={moduleStyles.controlButton}
          onClick={onStep}
          disabled={!canStep}
        >
          Step ▶
        </button>
        <button
          className={moduleStyles.controlButton}
          onClick={onPlay}
          disabled={!canPlay}
        >
          Play ▶▶
        </button>
      </div>

      {/* SVG canvas */}
      <svg
        className={moduleStyles.svgCanvas}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {points.length === 0 && (
          <text
            x={SVG_SIZE / 2}
            y={SVG_SIZE / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={14}
            fill="#aaa"
          >
            Run your code to add data points
          </text>
        )}

        {/* Data points */}
        {points.map((point: Point) => {
          const clusterId = assignments.get(point.id);
          const fill =
            clusterId !== undefined
              ? CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length]
              : UNASSIGNED_COLOR;
          return (
            <circle
              key={point.id}
              cx={toSvgX(point.x)}
              cy={toSvgY(point.y)}
              r={POINT_RADIUS}
              fill={fill}
              stroke="#fff"
              strokeWidth={1.5}
              style={{transition: `fill ${ASSIGN_ANIMATION_MS}ms ease`}}
            />
          );
        })}

        {/* Centroids */}
        {centroids.map((centroid: Centroid) => (
          <g
            key={centroid.id}
            style={{
              transform: `translate(${toSvgX(centroid.x)}px, ${toSvgY(centroid.y)}px)`,
              transition: `transform ${CENTROID_MOVE_ANIMATION_MS}ms ease`,
            }}
          >
            <polygon
              points={diamondPoints(CENTROID_SIZE)}
              fill={CLUSTER_COLORS[centroid.id % CLUSTER_COLORS.length]}
              stroke="#fff"
              strokeWidth={2}
            />
          </g>
        ))}
      </svg>

      {/* Status bar */}
      <div className={moduleStyles.status}>
        {iteration > 0 && <span>Iteration: {iteration}</span>}
        {converged && (
          <span className={moduleStyles.convergedBadge}>✓ Converged</span>
        )}
        {!isReady && points.length === 0 && (
          <span className={moduleStyles.emptyMessage}>
            Waiting for data...
          </span>
        )}
      </div>
    </div>
  );
};

export default KMeansVisualization;
