import React from 'react';
import sinon from 'sinon';
import {shallow, mount} from 'enzyme';

import * as expandableImages from '@cdo/apps/templates/utils/expandableImages';
import {StatelessEnhancedSafeMarkdown as EnhancedSafeMarkdown} from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {expect} from '../../util/deprecatedChai';

describe('EnhancedSafeMarkdown', () => {
  describe('markdownPostRenderHook', () => {
    let wrapper, hookSpy;

    beforeEach(() => {
      wrapper = shallow(<EnhancedSafeMarkdown markdown="test" />);
      hookSpy = sinon.spy(wrapper.instance(), 'markdownPostRenderHook');
    });

    afterEach(() => {
      hookSpy.restore();
    });

    it('calls the post render hook after updating markdown', () => {
      expect(hookSpy).not.to.have.been.calledOnce;
      wrapper.setProps({markdown: 'update'});
      expect(hookSpy).to.have.been.calledOnce;
    });

    it('does not call the post render hook if non-markdown props change', () => {
      expect(hookSpy).not.to.have.been.calledOnce;
      wrapper.setProps({openExternalLinksInNewTab: true});
      expect(hookSpy).not.to.have.been.calledOnce;
    });
  });

  describe('expandable images', () => {
    let renderSpy;

    beforeEach(() => {
      renderSpy = sinon.spy(expandableImages, 'renderExpandableImages');
    });

    afterEach(() => {
      renderSpy.restore();
    });

    it('does not attempt to render expandable images unless explicitly told to do so', () => {
      shallow(<EnhancedSafeMarkdown markdown="test" />);
      expect(renderSpy).not.to.have.been.calledOnce;
    });

    it('attempts to render expandable images if told to do so', () => {
      // we use mount here because `renderExpandableImages` wants an actual DOM
      // node. We could alternatively mock the method if we for some reason
      // decide that mount is undesirable
      mount(
        <EnhancedSafeMarkdown
          markdown="test"
          expandableImages={true}
          showImageDialog={() => {}}
        />
      );
      expect(renderSpy).to.have.been.calledOnce;
    });
  });
});
