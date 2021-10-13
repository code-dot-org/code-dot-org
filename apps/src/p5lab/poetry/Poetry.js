import msg from '@cdo/poetry/locale';
import {getStore} from '@cdo/apps/redux';
import {setPoem} from '../redux/poetry';
import {P5LabType} from '../constants';
import SpriteLab from '../spritelab/SpriteLab';
import PoetryLibrary from './PoetryLibrary';
import {POEMS} from './constants';

export default class Poetry extends SpriteLab {
  init(config) {
    super.init(config);
    const poem = config.level.selectedPoem || getPoem(this.level.defaultPoem);
    if (poem) {
      getStore().dispatch(setPoem(poem));
    }
  }

  getAvatarUrl(levelInstructor) {
    const defaultAvatar = 'octi';
    return `/blockly/media/poetry/${levelInstructor || defaultAvatar}.png`;
  }

  getMsg() {
    return msg;
  }

  getLabType() {
    return P5LabType.POETRY;
  }

  createLibrary(args) {
    if (!args.p5) {
      console.warn('cannot create poetry library without p5 instance');
      return;
    }
    return new PoetryLibrary(args.p5);
  }

  setupReduxSubscribers(store) {
    super.setupReduxSubscribers(store);
    let state = {};
    store.subscribe(() => {
      const lastState = state;
      state = store.getState();

      if (
        lastState.poetry &&
        lastState.poetry.selectedPoem.title !== state.poetry.selectedPoem.title
      ) {
        this.reset();
      }
    });
  }
}

export function getPoem(key) {
  if (!key || !POEMS[key]) {
    return undefined;
  }
  return {
    key: key,
    author: POEMS[key].author,
    title: msg[`${key}Title`](),
    lines: msg[`${key}Lines`]().split('\n')
  };
}
