import './unit/stubTextMeasurement';

global.ResizeObserver = class {
  observe() {}
  disconnect() {}
};
