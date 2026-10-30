import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import EnhancedSafeMarkdown, {
  ExpandableImagesWrapper,
  UnconnectedExpandableImagesWrapper,
} from '@cdo/apps/templates/EnhancedSafeMarkdown';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import * as expandableImages from '@cdo/apps/templates/utils/expandableImages';

describe('EnhancedSafeMarkdown', () => {
  it('renders SafeMarkdown by default', () => {
    const wrapper = shallow(<EnhancedSafeMarkdown markdown="test" />);
    expect(wrapper.equals(<SafeMarkdown markdown="test" />)).toBe(true);
  });

  it('renders SafeMarkdown by default with class name', () => {
    const wrapper = shallow(
      <EnhancedSafeMarkdown markdown="test" className="class test" />
    );
    expect(
      wrapper.equals(<SafeMarkdown markdown="test" className="class test" />)
    ).toBe(true);
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
    ).toBe(true);
  });

  describe('ExpandableImagesWrapper', () => {
    it('renders expandable images', () => {
      const renderSpy = jest
        .spyOn(expandableImages, 'renderExpandableImages')
        .mockClear();
      // We use mount rather than shallow here because renderExpandableImages
      // expects an actual node as an argument
      mount(
        <UnconnectedExpandableImagesWrapper showImageDialog={() => {}}>
          <span className="expandable-image" />
        </UnconnectedExpandableImagesWrapper>
      );
      expect(renderSpy).toHaveBeenCalledTimes(1);
      renderSpy.mockRestore();
    });
  });
});
