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

  beforeEach(() => {
    const store = createStore(combineReducers({responsive, isRtl}));
    root = mount(
      <Provider store={store}>
        <Congrats
          completedTutorialType="other"
        />
      </Provider>
    );
  });

  it('renders a Certificate component', () => {
    expect(root.find('Certificate').exists());
  });

  it('renders a StudentsBeyondHoc component', () => {
    expect(root.find('StudentsBeyondHoc').exists());
  });

  it('renders a TeachersBeyondHoc component', () => {
    expect(root.find('TeachersBeyondHoc').exists());
  });
});
