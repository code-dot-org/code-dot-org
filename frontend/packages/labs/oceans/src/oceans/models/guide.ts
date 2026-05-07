import {getState, setState} from '../state';
import {queryStrFor} from '../helpers';
import guidesHoc from './guidesHoc';
import guidesK5 from './guidesK5';

const getCurrentGuide = () => {
  if (queryStrFor('guide') === 'off') {
    return null;
  }

  const state = getState();

  const currentGuides = state.guides === 'K5' ? guidesK5 : guidesHoc;

  for (const guide of currentGuides) {
    // If the current state matches the guide's requirements...
    if (
      Object.keys(guide.when).every(key => {
        return key === 'fn'
          ? guide.when['fn'](getState())
          : guide.when[key] === state[key];
      })
    ) {
      // And if we haven't already dismissed this particular guide...
      if (
        !(state.guideDismissals && state.guideDismissals.includes(guide.id))
      ) {
        return guide;
      }
    }
  }

  return null;
};

const dismissCurrentGuide = () => {
  const currentGuide = getCurrentGuide();

  // If we have a current guide, and it's actually showing (rather than still
  // typing).
  if (currentGuide && getState().guideShowing) {
    const state = getState();
    const currentGuideDismissals = state.guideDismissals;
    let newGuideDismissals = [...currentGuideDismissals];
    newGuideDismissals.push(currentGuide.id);
    setState({guideDismissals: newGuideDismissals, guideShowing: false});

    return true;
  }

  return false;
};

export default {
  getCurrentGuide,
  dismissCurrentGuide
};
