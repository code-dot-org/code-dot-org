import React from 'react';
import sinon from 'sinon';
import {shallow, mount} from 'enzyme';

import * as expandableImages from '@cdo/apps/templates/utils/expandableImages';
import EnhancedSafeMarkdown, {
  ExpandableImagesWrapper,
  UnconnectedExpandableImagesWrapper
} from '@cdo/apps/templates/EnhancedSafeMarkdown';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {expect} from '../../util/reconfiguredChai';

describe('EnhancedSafeMarkdown', () => {
  it('renders SafeMarkdown by default', () => {
    const wrapper = shallow(<EnhancedSafeMarkdown markdown="test" />);
    expect(wrapper.equals(<SafeMarkdown markdown="test" />)).to.equal(true);
  });

  it('wraps output in enhancements as specified', () => {
    const wrapper = shallow(
      <EnhancedSafeMarkdown markdown="test" expandableImages />
    );
    expect(
      wrapper.equals(
        <ExpandableImagesWrapper>
          <SafeMarkdown markdown="test" />
        </ExpandableImagesWrapper>
      )
    ).to.equal(true);
  });

  describe('ExpandableImagesWrapper', () => {
    it('renders expandable images', () => {
      const renderSpy = sinon.spy(expandableImages, 'renderExpandableImages');
      // We use mount rather than shallow here because renderExpandableImages
      // expects an actual node as an argument
      mount(
        <UnconnectedExpandableImagesWrapper showImageDialog={() => {}}>
          <span className="expandable-image" />
        </UnconnectedExpandableImagesWrapper>
      );
      expect(renderSpy).to.have.been.calledOnce;
      renderSpy.restore();
    });
  });
});
