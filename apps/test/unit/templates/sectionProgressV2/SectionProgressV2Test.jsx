import React from 'react';
import {mount, shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import * as progressLoader from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import {UnconnectedSectionProgressV2} from '@cdo/apps/templates/sectionProgressV2/SectionProgressV2.jsx';
import ProgressTableV2 from '@cdo/apps/templates/sectionProgressV2/ProgressTableV2';
import {Heading6} from '@cdo/apps/componentLibrary/typography';

describe('SectionProgressV2', () => {
  const DEFAULT_PROPS = {
    scriptId: 1,
    sectionId: 1,
    unitData: {
      id: 123,
      path: '/scripts/myunit',
      lessons: [
        {
          id: 456,
          levels: [{id: '789'}],
        },
      ],
      csf: true,
      hasStandards: true,
    },
    isLoadingProgress: false,
    isRefreshingProgress: false,
  };
  beforeEach(() => {
    sinon.stub(progressLoader, 'loadUnitProgress');
  });

  afterEach(() => {
    progressLoader.loadUnitProgress.restore();
  });

  const setUp = (overrideProps = {}) => {
    return shallow(
      <UnconnectedSectionProgressV2 {...DEFAULT_PROPS} {...overrideProps} />
    );
  };

  it('loads progress on mount', () => {
    mount(<UnconnectedSectionProgressV2 {...DEFAULT_PROPS} unitData={null} />);
    expect(progressLoader.loadUnitProgress).to.have.been.calledOnce;
  });

  it('does not show table if loading', () => {
    const wrapper = setUp({isLoadingProgress: true});
    expect(wrapper.find(ProgressTableV2)).to.have.length(0);
  });

  it('shows students and unit selector', () => {
    const wrapper = setUp();
    expect(wrapper.find(Heading6)).to.have.length(2);
  });
});
