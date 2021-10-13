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
    const poem = config.level.selectedPoem || POEMS[this.level.defaultPoem];
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

  preloadInstructorImage() {
    const preloadInstructorImage_ = new Promise(resolve => {
      this.p5Wrapper.p5.loadImage(
        'https://studio.code.org/blockly/media/poetry/octiHappy.png',
        image => {
          this.preloadedInstructorImage = image;
          resolve();
        },
        err => {
          console.log(err);
          resolve();
        }
      );
    });
    return preloadInstructorImage_.then(
      (this.p5Wrapper.p5._preloadedInstructorImage = this.preloadedInstructorImage)
    );
  }

  preloadLabAssets() {
    return Promise.all([
      super.preloadLabAssets(),
      this.preloadInstructorImage()
    ]);
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
