import Lab2Registry from '../Lab2Registry';

export const logOnResize = () => {
  Lab2Registry.getInstance()
    .getMetricsReporter()
    .incrementCounter('Lab2.DragToResize');
};
