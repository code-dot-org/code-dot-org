import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../util/configuredChai';
import Congrats from '@cdo/apps/templates/Congrats';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

describe('Congrats', () => {
  let root;

  it('renders a Certificate component', () => {
    const store = createStore(combineReducers({responsive, isRtl}));
    root = mount(
      <Provider store={store}>
        <Congrats
          completedTutorialType="other"
          userType="signedOut"
          isEnglish={true}
        />
      </Provider>
    );
    expect(root.find('Certificate').exists());
  });

  it('renders a StudentsBeyondHoc component', () => {
    const store = createStore(combineReducers({responsive, isRtl}));
    root = mount(
      <Provider store={store}>
        <Congrats
          completedTutorialType="other"
          userType="signedOut"
          isEnglish={true}
        />
      </Provider>
    );
    expect(root.find('StudentsBeyondHoc').exists());
  });

  it('renders a TeachersBeyondHoc component, for teachers', () => {
    const store = createStore(combineReducers({responsive, isRtl}));
    root = mount(
      <Provider store={store}>
        <Congrats
          completedTutorialType="other"
          userType="teacher"
          isEnglish={true}
        />
      </Provider>
    );
    expect(root.find('TeachersBeyondHoc').exists());
  });

  it('renders a TeachersBeyondHoc component, for signed out', () => {
    const store = createStore(combineReducers({responsive, isRtl}));
    root = mount(
      <Provider store={store}>
        <Congrats
          completedTutorialType="other"
          userType="signedOut"
          isEnglish={true}
        />
      </Provider>
    );
    expect(root.find('TeachersBeyondHoc').exists());
  });

  it('does not render a TeachersBeyondHoc component, for students', () => {
    const store = createStore(combineReducers({responsive, isRtl}));
    root = mount(
      <Provider store={store}>
        <Congrats
          completedTutorialType="other"
          userType="student"
          isEnglish={true}
        />
      </Provider>
    );
    expect(root.find('TeachersBeyondHoc').exists()).to.be.false;
  });
});
