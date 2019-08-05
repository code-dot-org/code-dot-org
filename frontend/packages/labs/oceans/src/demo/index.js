import 'babel-polyfill';
import MLActivities from '../MLActivities';
import RPS from '../activities/rps/rps';

MLActivities.helloWorld();

window.addEventListener('load', () => {
  new RPS();
});
