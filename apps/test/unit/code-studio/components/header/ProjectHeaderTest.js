import React from 'react';
import {shallow} from 'enzyme';

import {expect} from '../../../../util/reconfiguredChai';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

import ProjectImport from '@cdo/apps/code-studio/components/header/ProjectImport';
import ProjectHeader from '@cdo/apps/code-studio/components/header/ProjectHeader';

describe('ProjectHeader', () => {
  beforeEach(() => {
    replaceOnWindow('appOptions', {
      level: {}
    });
    replaceOnWindow('dashboard', {
      i18n: {
        t: () => {}
      }
    });
  });

  afterEach(() => {
    restoreOnWindow('appOptions');
    restoreOnWindow('dashboard');
  });

  it('renders', () => {
    shallow(<ProjectHeader />);
  });

  it('includes ProjectImport for Code Connection projects', () => {
    window.appOptions.level.isConnectionLevel = true;
    const wrapper = shallow(<ProjectHeader />);
    expect(wrapper.find(ProjectImport)).to.have.lengthOf(1);
  });
});
