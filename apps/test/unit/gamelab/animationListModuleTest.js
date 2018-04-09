import {combineReducers} from 'redux';
import sinon from 'sinon';
import reducer, {
    START_LOADING_FROM_SOURCE,
    DONE_LOADING_FROM_SOURCE,
    animationSourceUrl,
    setInitialAnimationList,
    deleteAnimation,
    cloneAnimation,
    addBlankAnimation,
    addLibraryAnimation,
    withAbsoluteSourceUrls,
    appendBlankFrame,
    appendLibraryFrames,
    appendCustomFrames,
    saveAnimation
} from '@cdo/apps/gamelab/animationListModule';
import animationTab from '@cdo/apps/gamelab/AnimationTab/animationTabModule';
import {EMPTY_IMAGE} from '@cdo/apps/gamelab/constants';
import {createStore} from '../../util/redux';
import {expect} from '../../util/configuredChai';
import {setExternalGlobals} from '../../util/testUtils';
const project = require('@cdo/apps/code-studio/initApp/project');

describe('animationListModule', function () {
  setExternalGlobals(beforeEach, afterEach);
  describe('animationSourceUrl', function () {
    const key = 'foo';

    it(`returns the sourceUrl from props if it exists and is not an uploaded image`, function () {
      const props = {sourceUrl: 'bar'};
      expect(animationSourceUrl(key, props, '123')).to.equal('bar');
    });

    it(`returns the sourceUrl from props if it exists and contains the version`, function () {
      const props = {sourceUrl: '/v3/animations/test?version=bar'};
      expect(animationSourceUrl(key, props, '123')).to.equal('/v3/animations/test?version=bar');
    });

    it(`returns the sourceUrl from props if it exists in a different channel`, function () {
      const props = {sourceUrl: '/v3/animations/456/789'};
      expect(animationSourceUrl(key, props, '123')).to.equal('/v3/animations/456/789');
    });

    it(`returns the sourceUrl from a non-deleted, uploaded animation with the version`, function () {
      const props = {sourceUrl: '/v3/animations/123/foo', version:'alpha'};
      expect(animationSourceUrl(key, props, '123')).to.equal('/v3/animations/123/foo?version=alpha');
    });

    it(`returns the sourceUrl from a deleted, uploaded animation with the version`, function () {
      const props = {sourceUrl: '/v3/animations/123/bar', version:'beta'};
      expect(animationSourceUrl(key, props, '123')).to.equal('/v3/animations/123/bar?version=beta');
    });

    it(`returns the sourceUrl from a non-deleted, uploaded animation with no version specified`, function () {
      const props = {sourceUrl: '/v3/animations/123/foo'};
      expect(animationSourceUrl(key, props, '123')).to.equal('/v3/animations/123/foo?version=latestVersion');
    });

    it(`returns the sourceUrl from a deleted, uploaded animation with no version specified`, function () {
      const props = {sourceUrl: '/v3/animations/123/bar'};
      expect(animationSourceUrl(key, props, '123')).to.equal('/v3/animations/123/bar?version=latestVersion');
    });

    it(`returns the sourceUrl passed through the media proxy if it's an aboslute url`, function () {
      const insecureProps = {sourceUrl: 'http://bar'};
      expect(animationSourceUrl(key, insecureProps, '123'))
          .to.equal(`//${document.location.host}/media?u=http%3A%2F%2Fbar`);

      const secureProps = {sourceUrl: 'https://bar'};
      expect(animationSourceUrl(key, secureProps, '123'))
          .to.equal(`//${document.location.host}/media?u=https%3A%2F%2Fbar`);
    });

    it(`constructs a sourceUrl from key, version, and project if one isn't provided`, function () {
      const props = {sourceUrl: null, version: 'test-version'};
      expect(animationSourceUrl(key, props, '123')).to.equal('/v3/animations/fake_id/foo.png?version=test-version');
    });

    it(`has empty version queryParam when version is falsy`, function () {
      let nullProps = {sourceUrl: null, version: null};
      expect(animationSourceUrl(key, nullProps, '123')).to.equal('/v3/animations/fake_id/foo.png?version=');

      let undefinedProps = {sourceUrl: null, version: undefined};
      expect(animationSourceUrl(key, undefinedProps, '123')).to.equal('/v3/animations/fake_id/foo.png?version=');

      let falseProps = {sourceUrl: null, version: false};
      expect(animationSourceUrl(key, falseProps, '123')).to.equal('/v3/animations/fake_id/foo.png?version=');

      let zeroProps = {sourceUrl: null, version: 0};
      expect(animationSourceUrl(key, zeroProps, '123')).to.equal('/v3/animations/fake_id/foo.png?version=');
    });
  });

  describe('loadAnimationFromSource', function () {
    // Note: I'm basically unable to test loadAnimationFromSource right now,
    // because it makes an external request for a Blob and sinon can't fake
    // a request for a blob under PhantomJS (grr) so I need to do some refactoring
    // to allow me to stub a request method.  in the meantime, I'll show
    // that the reducer responds as expected.

    const key = 'foo';
    let store;

    beforeEach(function () {
      store = createStore(combineReducers({animationList: reducer}), {
        animationList: {
          orderedKeys: [key],
          propsByKey: {
            [key]: {
              sourceUrl: 'anything (we stub this)'
            }
          }
        }
      });
    });

    it('sets the loadedFromSource flag', function () {
      // TODO run loadAnimationFromSource action here when we can stub the request
      expect(store.getState().animationList.propsByKey[key].loadedFromSource).to.be.undefined;
      store.dispatch({type: START_LOADING_FROM_SOURCE, key});
      expect(store.getState().animationList.propsByKey[key].loadedFromSource).to.be.false;
      store.dispatch({
        type: DONE_LOADING_FROM_SOURCE,
        key
      });
      expect(store.getState().animationList.propsByKey[key].loadedFromSource).to.be.true;
    });

    it('populates animation blob', function () {
      // TODO run loadAnimationFromSource action here when we can stub the request
      expect(store.getState().animationList.propsByKey[key].blob).to.be.undefined;
      store.dispatch({type: START_LOADING_FROM_SOURCE, key});
      expect(store.getState().animationList.propsByKey[key].blob).to.be.undefined;
      store.dispatch({
        type: DONE_LOADING_FROM_SOURCE,
        key,
        blob: new Blob([])
      });
      expect(store.getState().animationList.propsByKey[key].blob).not.to.be.undefined;
    });

    it('populates animation dataURI', function () {
      // TODO run loadAnimationFromSource action here when we can stub the request
      expect(store.getState().animationList.propsByKey[key].dataURI).to.be.undefined;
      store.dispatch({type: START_LOADING_FROM_SOURCE, key});
      expect(store.getState().animationList.propsByKey[key].dataURI).to.be.undefined;
      store.dispatch({
        type: DONE_LOADING_FROM_SOURCE,
        key,
        dataURI: EMPTY_IMAGE
      });
      expect(store.getState().animationList.propsByKey[key].dataURI).not.to.be.undefined;
    });

    it('populates animation sourceSize', function () {
      // TODO run loadAnimationFromSource action here when we can stub the request
      expect(store.getState().animationList.propsByKey[key].sourceSize).to.be.undefined;
      store.dispatch({type: START_LOADING_FROM_SOURCE, key});
      expect(store.getState().animationList.propsByKey[key].sourceSize).to.be.undefined;
      store.dispatch({
        type: DONE_LOADING_FROM_SOURCE,
        key,
        sourceSize: {x: 1, y: 1}
      });
      expect(store.getState().animationList.propsByKey[key].sourceSize).not.to.be.undefined;
    });
  });

  let createAnimationList = function (count) {
    let orderedKeys = [];
    let propsByKey = {};
    let baseKey = 'animation';
    for (let i = 1; i <= count; i++) {
      let key = baseKey + '_' + i;
      orderedKeys.push(key);

      propsByKey[key] = {
        name: key,
        sourceUrl: null,
        frameSize: {x: 100, y: 100},
        frameCount: 1,
        looping: true,
        frameDelay: 4,
        version: null
      };
    }
    return {orderedKeys: orderedKeys, propsByKey: propsByKey};
  };

  describe('action: set initial animationList', function () {
    let server, store;
    beforeEach(function () {
      project.getCurrentId.returns('');
      server = sinon.fakeServer.create();
      server.respondWith('imageBody');
      store = createStore(combineReducers({animationList: reducer, animationTab}), {});
    });

    afterEach(function () {
      server.restore();
    });

    it('when animationList has 1 item, selectedAnimation should be the animation', function () {
      const key0 = 'animation_1';
      let animationList = createAnimationList(1);

      store.dispatch(setInitialAnimationList(animationList));
      expect(store.getState().animationTab.selectedAnimation).to.equal(key0);
    });

    it('when animationList has multiple items, selectedAnimation should be the first animation', function () {
      const key0 = 'animation_1';
      let animationList = createAnimationList(2);

      store.dispatch(setInitialAnimationList(animationList));
      expect(store.getState().animationTab.selectedAnimation).to.equal(key0);
    });

    it('when animationList has 0 items, selectedAnimation should be the empty string', function () {
      let animationList = {
        orderedKeys: [],
        propsByKey: {}
      };
      store.dispatch(setInitialAnimationList(animationList));
      expect(store.getState().animationTab.selectedAnimation).to.equal('');
    });

    it('should not initialize with multiple animations of the same name', function () {
      let animationList = createAnimationList(3);
      animationList.propsByKey["animation_1"].name = 'cat';
      animationList.propsByKey["animation_3"].name = 'cat';
      store.dispatch(setInitialAnimationList(animationList));

      expect(store.getState().animationList.propsByKey["animation_1"].name).to.equal('cat');
      expect(store.getState().animationList.propsByKey["animation_2"].name).to.equal('animation_2');
      expect(store.getState().animationList.propsByKey["animation_3"].name).to.equal('cat_1');
    });

    it('should not initialize with multiple animations of the same name with non alpha characters', function () {
      let animationList = createAnimationList(3);
      animationList.propsByKey["animation_1"].name = 'images (1).jpg_1';
      animationList.propsByKey["animation_2"].name = 'images (1).jpg_1';
      animationList.propsByKey["animation_3"].name = 'images (1).jpg_1';
      store.dispatch(setInitialAnimationList(animationList));

      expect(store.getState().animationList.propsByKey["animation_1"].name).to.equal('images (1).jpg_1');
      expect(store.getState().animationList.propsByKey["animation_2"].name).to.equal('images (1).jpg_1_1');
      expect(store.getState().animationList.propsByKey["animation_3"].name).to.equal('images (1).jpg_1_2');
    });
  });

  describe('action: delete animation', function () {
    let server;
    beforeEach(function () {
      project.getCurrentId.returns('');
      sinon.stub(project, 'projectChanged').returns('');

      server = sinon.fakeServer.create();
      server.respondWith('imageBody');
    });

    afterEach(function () {
      server.restore();
      project.projectChanged.restore();
    });

    it('deleting the first animation reselects the next animation in the animationList', function () {
      const key0 = 'animation_1';
      const key1 = 'animation_2';
      let animationList = createAnimationList(2);

      let store = createStore(combineReducers({animationList: reducer, animationTab}), {});
      store.dispatch(setInitialAnimationList(animationList));
      store.dispatch(deleteAnimation(key0));
      expect(store.getState().animationTab.selectedAnimation).to.equal(key1);
    });

    it('deleting an animation reselects the previous animation in the animationList', function () {
      const key0 = 'animation_1';
      const key1 = 'animation_2';
      let animationList = createAnimationList(2);

      let store = createStore(combineReducers({animationList: reducer, animationTab}), {});
      store.dispatch(setInitialAnimationList(animationList));
      store.dispatch(deleteAnimation(key1));
      expect(store.getState().animationTab.selectedAnimation).to.equal(key0);
    });

    it('deleting an animation deselects when there are no other animations in the animationList', function () {
      const key0 = 'animation_1';
      let animationList = createAnimationList(1);
      let store = createStore(combineReducers({animationList: reducer, animationTab}), {});
      store.dispatch(setInitialAnimationList(animationList));
      store.dispatch(deleteAnimation(key0));
      expect(store.getState().animationTab.selectedAnimation).to.equal('');
    });
  });

  describe('action: clone animation', function () {
    let server;
    beforeEach(function () {
      project.getCurrentId.returns('');
      sinon.stub(project, 'projectChanged').returns('');

      server = sinon.fakeServer.create();
      server.respondWith('imageBody');
    });

    afterEach(function () {
      server.restore();
      project.projectChanged.restore();
    });

    it('cloning animation creates an animation with the same props, and unique name', function () {
      const key0 = 'animation_1';
      const animationList = createAnimationList(1);

      let store = createStore(combineReducers({animationList: reducer, animationTab}), {});
      store.dispatch(setInitialAnimationList(animationList));
      store.dispatch(cloneAnimation(key0));

      expect(store.getState().animationList.orderedKeys.length).to.equal(2);

      const clonedAnimationKey = store.getState().animationList.orderedKeys[1];
      const clonedAnimation = store.getState().animationList.propsByKey[clonedAnimationKey];
      const originalAnimation = store.getState().animationList.propsByKey[key0];

      expect(clonedAnimation.name).to.not.equal(originalAnimation.name);
      expect(clonedAnimation.frameSize).to.equal(originalAnimation.frameSize);
      expect(clonedAnimation.frameCount).to.equal(originalAnimation.frameCount);
      expect(clonedAnimation.frameDelay).to.equal(originalAnimation.frameDelay);
      expect(clonedAnimation.looping).to.equal(originalAnimation.looping);
      expect(clonedAnimation.sourceUrl).to.equal(originalAnimation.sourceUrl);
      expect(clonedAnimation.version).to.equal(originalAnimation.version);
    });

    it('cloning an animation twice creates two animations with unique names', function () {
      const key0 = 'animation_1';
      const animationList = createAnimationList(1);

      let store = createStore(combineReducers({animationList: reducer, animationTab}), {});
      store.dispatch(setInitialAnimationList(animationList));
      store.dispatch(cloneAnimation(key0));
      store.dispatch(cloneAnimation(key0));

      const orignalAnimation = store.getState().animationList.propsByKey[key0];
      const clonedAnimationKey2 = store.getState().animationList.orderedKeys[1];
      const clonedAnimation2 = store.getState().animationList.propsByKey[clonedAnimationKey2];
      const clonedAnimationKey1 = store.getState().animationList.orderedKeys[2];
      const clonedAnimation1 = store.getState().animationList.propsByKey[clonedAnimationKey1];

      expect(store.getState().animationList.orderedKeys.length).to.equal(3);
      expect(orignalAnimation.name).to.not.equal(clonedAnimation1.name);
      expect(orignalAnimation.name).to.not.equal(clonedAnimation2.name);
      expect(clonedAnimation1.name).to.not.equal(clonedAnimation2.name);
    });
  });

  describe('action: add blank animation', function () {
    let server, store;
    beforeEach(function () {
      project.getCurrentId.returns('');
      sinon.stub(project, 'projectChanged').returns('');

      server = sinon.fakeServer.create();
      server.respondWith('imageBody');
      store = createStore(combineReducers({animationList: reducer, animationTab}), {});
    });

    afterEach(function () {
      server.restore();
      project.projectChanged.restore();
    });

    it('new blank animations get name animation_1 when it is the first blank animation', function () {
      store.dispatch(addBlankAnimation());
      let blankAnimationKey = store.getState().animationList.orderedKeys[0];
      expect(store.getState().animationList.propsByKey[blankAnimationKey].name).to.equal('animation_1');
    });

    it('new blank animations get name next available number appended', function () {
      let animationList = createAnimationList(2);
      store.dispatch(setInitialAnimationList(animationList));
      store.dispatch(addBlankAnimation());

      let blankAnimationKey = store.getState().animationList.orderedKeys[2];
      expect(store.getState().animationList.propsByKey[blankAnimationKey].name).to.equal('animation_3');
    });

    it('new blank animations get name next available number appended when available number is in the middle of the list', function () {
      const key1 = 'animation_2';
      let animationList = createAnimationList(3);
      store.dispatch(setInitialAnimationList(animationList));
      store.dispatch(deleteAnimation(key1));
      expect(store.getState().animationList.orderedKeys.length).to.equal(2);
      store.dispatch(addBlankAnimation());
      expect(store.getState().animationList.orderedKeys.length).to.equal(3);
      let blankAnimationKey = store.getState().animationList.orderedKeys[2];
      expect(store.getState().animationList.propsByKey[blankAnimationKey].name).to.equal('animation_2');
    });
  });

  describe('action: add library animation', function () {
    let server, store;
    beforeEach(function () {
      project.getCurrentId.returns('');
      sinon.stub(project, 'projectChanged').returns('');
      server = sinon.fakeServer.create();
      server.respondWith('imageBody');
      store = createStore(combineReducers({animationList: reducer, animationTab}), {});
    });

    afterEach(function () {
      server.restore();
      project.projectChanged.restore();
    });

    it('new animations get name _# appended to the name in order of numbers available', function () {
      const libraryAnimProps = {
        name: 'library_animation',
        sourceUrl: 'url',
        frameSize: {x: 100, y: 100},
        frameCount: 1,
        looping: true,
        frameDelay: 4,
        version: null
      };
      store.dispatch(addLibraryAnimation(libraryAnimProps));
      let blankAnimationKey1 = store.getState().animationList.orderedKeys[0];
      expect(store.getState().animationList.propsByKey[blankAnimationKey1].name).to.equal('library_animation_1');

      store.dispatch(addLibraryAnimation(libraryAnimProps));
      let blankAnimationKey2 = store.getState().animationList.orderedKeys[1];
      expect(store.getState().animationList.propsByKey[blankAnimationKey2].name).to.equal('library_animation_2');

      store.dispatch(addLibraryAnimation(libraryAnimProps));
      let blankAnimationKey3 = store.getState().animationList.orderedKeys[2];
      expect(store.getState().animationList.propsByKey[blankAnimationKey3].name).to.equal('library_animation_3');

      store.dispatch(deleteAnimation(blankAnimationKey2));

      store.dispatch(addLibraryAnimation(libraryAnimProps));
      let blankAnimationKey4 = store.getState().animationList.orderedKeys[2];
      expect(store.getState().animationList.propsByKey[blankAnimationKey4].name).to.equal('library_animation_2');
    });
  });

  describe('withAbsoluteSourceUrls', function () {
    function expectDeepEqual(a, b) {
      expect(a).to.deep.equal(b,
        "Expected to be deeply equal:\n" +
        "<<<<<<<<\n" +
        JSON.stringify(a, null, 2) + "\n" +
        "--------\n" +
        JSON.stringify(b, null, 2) + "\n" +
        ">>>>>>>>\n");
    }

    it('generates absolute source URLs for animations with no source URL', function () {
      const serializedList = {
        orderedKeys: ['foo'],
        propsByKey: {
          'foo': {
            version: 'test-version'
          },
        }
      };
      expectDeepEqual(withAbsoluteSourceUrls(serializedList, '123'), {
        orderedKeys: ['foo'],
        propsByKey: {
          'foo': {
            version: 'test-version',
            sourceUrl: `${document.location.origin}/v3/animations/fake_id/foo.png?version=test-version`
          }
        }
      });
    });

    it('converts relative source URLs to absolute URLs', function () {
      const serializedList = {
        orderedKeys: ['foo'],
        propsByKey: {
          'foo': {
            sourceUrl: '/some-origin-relative-url'
          }
        }
      };
      expectDeepEqual(withAbsoluteSourceUrls(serializedList, '123'), {
        orderedKeys: ['foo'],
        propsByKey: {
          'foo': {
            sourceUrl: `${document.location.origin}/some-origin-relative-url`
          }
        }
      });
    });

    it('Uses media proxy for absolute URLs', function () {
      const serializedList = {
        orderedKeys: ['foo'],
        propsByKey: {
          'foo': {
            sourceUrl: 'http://host.com/some-absolute-url'
          }
        }
      };
      expectDeepEqual(withAbsoluteSourceUrls(serializedList, '123'), {
        orderedKeys: ['foo'],
        propsByKey: {
          'foo': {
            sourceUrl: `${document.location.origin}/media?u=http%3A%2F%2Fhost.com%2Fsome-absolute-url`
          }
        }
      });
    });
  });

  describe('action: add blank frame', function () {
    let server, store;
    beforeEach(function () {
      project.getCurrentId.returns('');
      sinon.stub(project, 'projectChanged').returns('');
      server = sinon.fakeServer.create();
      server.respondWith('imageBody');
      store = createStore(combineReducers({animationList: reducer, animationTab}), {});
    });

    afterEach(function () {
      server.restore();
      project.projectChanged.restore();
    });

    it('new blank frame gets added to pendingFrames and original animation is unchanged', function () {
      const animationList = createAnimationList(1);
      store.dispatch(setInitialAnimationList(animationList));
      const animationKey = store.getState().animationList.orderedKeys[0];
      store.dispatch(appendBlankFrame());
      expect(store.getState().animationList.propsByKey[animationKey].frameCount).to.equal(1);
      expect(store.getState().animationList.pendingFrames.key).to.equal(animationKey);
      expect(store.getState().animationList.pendingFrames.props.blankFrame).to.equal(true);
    });

    it('new blank pending frame uses the selectedAnimation key', function () {
      const animationList = createAnimationList(2);
      store.dispatch(setInitialAnimationList(animationList));
      const selectedAnimation = store.getState().animationTab.selectedAnimation;
      store.dispatch(appendBlankFrame());
      expect(store.getState().animationList.pendingFrames.key).to.equal(selectedAnimation);
    });
  });

  describe('action: append non blank frames', function () {
    let server, store, selectedAnimation, libraryAnimProps;
    beforeEach(function () {
      project.getCurrentId.returns('');
      sinon.stub(project, 'projectChanged').returns('');
      server = sinon.fakeServer.create();
      server.respondWith('imageBody');
      store = createStore(combineReducers({animationList: reducer, animationTab}), {});
      const animationList = createAnimationList(2);
      store.dispatch(setInitialAnimationList(animationList));
      selectedAnimation = store.getState().animationTab.selectedAnimation;
      libraryAnimProps = {
        name: 'library_animation',
        sourceUrl: 'url',
        frameSize: {x: 100, y: 100},
        frameCount: 1,
        looping: true,
        frameDelay: 4,
        version: null
      };
    });

    afterEach(function () {
      server.restore();
      project.projectChanged.restore();
    });

    it('append library frames adds props to pendingFrames for selectedAnimation', function () {
      store.dispatch(appendLibraryFrames(libraryAnimProps));
      expect(store.getState().animationList.pendingFrames.key).to.equal(selectedAnimation);
      expect(store.getState().animationList.pendingFrames.props).to.deep.equal(libraryAnimProps);
    });

    it('append custom frames adds props to pendingFrames for selected animation', function () {
      store.dispatch(appendCustomFrames(libraryAnimProps));
      expect(store.getState().animationList.pendingFrames.key).to.equal(selectedAnimation);
      expect(store.getState().animationList.pendingFrames.props).to.deep.equal(libraryAnimProps);
    });
  });

  describe('action: save animation', function () {
    let xhr, requests;
    beforeEach(function () {
      xhr = sinon.useFakeXMLHttpRequest();
      requests = [];
      xhr.onCreate = xhr => requests.push(xhr);
    });

    afterEach(function () {
      xhr.restore();
    });

    it('sends a save request', function () {
      const libraryAnimProps = {
        name: 'animation_1',
        sourceUrl: 'url',
        frameSize: {x: 100, y: 100},
        frameCount: 1,
        looping: true,
        frameDelay: 4,
        version: null
      };

      saveAnimation('animation_1', libraryAnimProps);
      expect(requests.length).to.equal(1);
      expect(requests[0].method).to.equal('PUT');
      expect(requests[0].url).to.equal("/v3/animations/fake_id/animation_1.png");
      expect(requests[0].requestHeaders['Content-type']).to.equal("image/png;charset=utf-8");
    });

  });
});
