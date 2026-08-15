import {buildWidgetDocument} from './widgetChrome';

const CSS = `
  #title { margin: 0 0 8px; }
  /* Dragging a bar must never start a text selection of the labels. The
     drawing keeps a readable width inside a full-width card: scaling a
     4-bar chart to a wide monitor makes comically fat bars and, because
     the aspect ratio is fixed, a very tall widget. */
  svg {
    width: 100%;
    max-width: 720px;
    height: auto;
    display: block;
    margin: 0 auto;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .bar { fill: #0093a4; }
  .bar.draggable { cursor: ns-resize; }
  .bar.draggable:hover, .bar.dragging { fill: #007786; }
  .bar-value { font-size: 12px; fill: #292f36; text-anchor: middle; }
  .axis-label { font-size: 11px; fill: #56626b; text-anchor: end; }
  .x-label { font-size: 12px; fill: #292f36; text-anchor: middle; }
  .gridline { stroke: #e7e9ea; stroke-width: 1; }
  .mean-line { stroke: #d14724; stroke-width: 2; stroke-dasharray: 6 4; }
  .mean-label { font-size: 12px; fill: #d14724; font-weight: 600; }
  #hint { margin-top: 4px; }
`;

const BODY = `
<h2 id="title"></h2>
<svg id="chart" viewBox="0 0 480 300" role="img" aria-label="Bar chart"></svg>
<div id="hint" class="sent-note"></div>
`;

const JS = String.raw`
(function () {
  'use strict';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const W = 480, H = 300;
  const M = {top: 20, right: 12, bottom: 30, left: 40};

  const state = {
    title: '',
    values: [],
    labels: [],
    showMean: false,
    editable: false,
    scaleMax: 10,
    dragIndex: -1,
    dragged: false,
  };

  const svg = document.getElementById('chart');
  const titleEl = document.getElementById('title');
  const hintEl = document.getElementById('hint');

  function el(name, attrs, text) {
    const node = document.createElementNS(SVG_NS, name);
    Object.keys(attrs).forEach(k => node.setAttribute(k, attrs[k]));
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function mean(values) {
    if (!values.length) {
      return 0;
    }
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  function yFor(value) {
    const plotH = H - M.top - M.bottom;
    return M.top + plotH * (1 - value / state.scaleMax);
  }

  function valueForY(y) {
    const plotH = H - M.top - M.bottom;
    const value = ((M.top + plotH - y) / plotH) * state.scaleMax;
    // Snap to halves so dragged values stay friendly for mental math.
    return Math.min(state.scaleMax, Math.max(0, Math.round(value * 2) / 2));
  }

  function render() {
    titleEl.textContent = state.title;
    svg.textContent = '';
    const n = state.values.length;
    if (!n) {
      return;
    }
    const plotW = W - M.left - M.right;
    const slot = plotW / n;
    const barW = slot * 0.65;

    // Gridlines and y-axis labels at 5 even steps.
    for (let i = 0; i <= 5; i++) {
      const value = (state.scaleMax / 5) * i;
      const y = yFor(value);
      svg.appendChild(
        el('line', {class: 'gridline', x1: M.left, x2: W - M.right, y1: y, y2: y})
      );
      svg.appendChild(
        el('text', {class: 'axis-label', x: M.left - 6, y: y + 4}, String(value))
      );
    }

    state.values.forEach((value, i) => {
      const x = M.left + slot * i + (slot - barW) / 2;
      const y = yFor(value);
      const bar = el('rect', {
        class:
          'bar' +
          (state.editable ? ' draggable' : '') +
          (state.dragIndex === i ? ' dragging' : ''),
        x: x,
        y: y,
        width: barW,
        height: Math.max(1, H - M.bottom - y),
        'data-index': i,
      });
      svg.appendChild(bar);
      svg.appendChild(
        el('text', {class: 'bar-value', x: x + barW / 2, y: y - 5}, String(value))
      );
      svg.appendChild(
        el(
          'text',
          {class: 'x-label', x: x + barW / 2, y: H - M.bottom + 16},
          state.labels[i] !== undefined ? state.labels[i] : String(i + 1)
        )
      );
    });

    if (state.showMean) {
      const m = mean(state.values);
      const y = yFor(m);
      svg.appendChild(
        el('line', {class: 'mean-line', x1: M.left, x2: W - M.right, y1: y, y2: y})
      );
      svg.appendChild(
        el(
          'text',
          {class: 'mean-label', x: M.left + 4, y: y - 6},
          'mean = ' + (Math.round(m * 100) / 100)
        )
      );
    }
  }

  function svgY(event) {
    const rect = svg.getBoundingClientRect();
    return ((event.clientY - rect.top) / rect.height) * H;
  }

  svg.addEventListener('pointerdown', event => {
    if (!state.editable) {
      return;
    }
    const index = event.target.getAttribute('data-index');
    if (index === null) {
      return;
    }
    // Selection can also start in the SVG and extend into surrounding text;
    // claiming the gesture here stops that at the source.
    event.preventDefault();
    state.dragIndex = Number(index);
    state.dragged = false;
    svg.setPointerCapture(event.pointerId);
  });

  svg.addEventListener('pointermove', event => {
    if (state.dragIndex < 0) {
      return;
    }
    const value = valueForY(svgY(event));
    if (value !== state.values[state.dragIndex]) {
      state.values[state.dragIndex] = value;
      state.dragged = true;
      render();
    }
  });

  svg.addEventListener('pointerup', () => {
    if (state.dragIndex < 0) {
      return;
    }
    state.dragIndex = -1;
    render();
    if (!state.dragged) {
      return;
    }
    // One event per completed drag, not per pixel: drag-end is the "major
    // interaction" worth the tutor's attention.
    McpApp.updateModelContext({
      content: [{type: 'text', text: 'The student changed the chart values.'}],
      structuredContent: {
        type: 'chart_values_changed',
        values: state.values.slice(),
        mean: Math.round(mean(state.values) * 1000) / 1000,
      },
    });
    hintEl.textContent = 'New values sent to your tutor.';
  });

  McpApp.on('toolInput', input => {
    state.title = input.title || 'Data';
    state.values = Array.isArray(input.values) ? input.values.slice() : [];
    state.labels = Array.isArray(input.labels) ? input.labels : [];
    state.showMean = !!input.showMean;
    state.editable = !!input.editable;
    // Fix the scale per invocation so dragging doesn't rescale mid-gesture.
    const top = Math.max.apply(null, state.values.concat([1]));
    state.scaleMax = Math.max(10, Math.ceil((top * 1.25) / 5) * 5);
    hintEl.textContent = state.editable
      ? 'Drag the top of a bar to change its value.'
      : '';
    render();
  });

  McpApp.connect();
})();
`;

export function buildChartWidgetHtml(): string {
  return buildWidgetDocument({
    title: 'Bar chart',
    css: CSS,
    bodyHtml: BODY,
    js: JS,
  });
}
