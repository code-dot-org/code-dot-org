import msg from '@cdo/poetry/locale';
import {getStore} from '@cdo/apps/redux';
import trackEvent from '@cdo/apps/util/trackEvent';
import {setPoem, hasSelectedPoemChanged} from '../redux/poetry';
import {P5LabType} from '../constants';
import SpriteLab from '../spritelab/SpriteLab';
import PoetryLibrary from './PoetryLibrary';
import {getPoem} from './poem';

export default class Poetry extends SpriteLab {
  init(config) {
    const loader = super.init(config);
    const poem = config.level.selectedPoem || getPoem(this.level.defaultPoem);
    if (poem) {
      getStore().dispatch(setPoem(poem));
    }
    return loader;
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

  // We do want levels that show the finish dialog using
  // this.studioApp_.displayFeedback to show the save & publish buttons.
  saveToProjectGallery() {
    return true;
  }

  createLibrary(args) {
    if (!args.p5) {
      console.warn('cannot create poetry library without p5 instance');
      return;
    }
    return new PoetryLibrary(args.p5);
  }

  runButtonClick() {
    super.runButtonClick();
    const poem = getPoem(getStore().getState().poetry?.selectedPoem?.key);
    const poemTitle = poem ? poem.title : 'Custom';
    trackEvent('HoC_Poem', 'Play-2021', poemTitle);
  }

  preloadInstructorImage() {
    if (!this.preloadInstructorImage_) {
      this.preloadInstructorImage_ = new Promise(resolve => {
        this.p5Wrapper.p5.loadImage(
          '/blockly/media/poetry/octiFinish.png',
          image => resolve(image),
          err => {
            console.error(err);
            resolve();
          }
        );
      });
    }

    return this.preloadInstructorImage_.then(
      image => (this.p5Wrapper.p5._preloadedInstructorImage = image)
    );
  }

  preloadFrames() {
    const frames = {
      bamboo: 'bamboo',
      beaded: 'beaded',
      brick: 'brick',
      decorative: 'decorative',
      donuts: 'donuts',
      fire: 'fire',
      flowers: 'flower-purple',
      gilded: 'gilded',
      hearts: 'heart-pink',
      iceCream: 'ice-cream',
      leaves: 'leaves',
      metal: 'metal',
      pawPrints: 'pawprint',
      rainbow: 'rainbow',
      stars: 'stars',
      swirls: 'swirlyline',
      waves: 'water',
      wood: 'wood',
      zigzag: 'lightning'
    };
    if (!this.preloadFrames_) {
      this.preloadFrames_ = Promise.all(
        Object.keys(frames).map(
          frame =>
            new Promise(resolve => {
              this.p5Wrapper.p5.loadImage(
                `/blockly/media/common_images/${frames[frame]}.png`,
                image => resolve({name: frame, image}),
                err => {
                  console.error(err);
                  resolve();
                }
              );
            })
        )
      );
    }

    return this.preloadFrames_.then(values => {
      this.p5Wrapper.p5._preloadedFrames = {};
      values.forEach(value => {
        this.p5Wrapper.p5._preloadedFrames[value.name] = value.image;
      });
    });
  }

  preloadLabAssets() {
    return Promise.all([
      super.preloadLabAssets(),
      this.preloadInstructorImage(),
      this.preloadFrames()
    ]);
  }

  setupReduxSubscribers(store) {
    super.setupReduxSubscribers(store);
    let state = {};
    store.subscribe(() => {
      const lastState = state;
      state = store.getState();

      if (lastState.poetry && hasSelectedPoemChanged(lastState, state)) {
        this.reset();
      }
    });
  }
}
