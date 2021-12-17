import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {isolateComponent} from 'isolate-components';
import {UnconnectedSetUpMessage} from '@cdo/apps/templates/studioHomepages/SetUpMessage';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';

describe('SetUpMessage', () => {
  const headingText = 'Do Something';
  const descriptionText = 'Get started now';
  const buttonText = 'Get to it';
  const buttonUrl = '/my/path';
  const defaultProps = {
    headingText,
    descriptionText,
    buttonText,
    buttonUrl
  };

  describe('default behavior', () => {
    const setUpMessage = isolateComponent(
      <UnconnectedSetUpMessage {...defaultProps} />
    );
    it('renders a heading', () => {
      expect(setUpMessage.content()).contains(descriptionText);
    });
    it('renders a description', () => {
      expect(setUpMessage.content()).contains(descriptionText);
    });
    it('renders a gray button with text', () => {
      const button = setUpMessage.findOne('Button');
      expect(button.props.text).to.equal(buttonText);
      expect(button.props.color).to.equal('gray');
    });
    it('has a dashed border', () => {
      expect(setUpMessage.findAll('div')[0].props.style).to.contain({
        borderStyle: 'dashed',
        borderWidth: 5
      });
    });
    it('button goes to url when clicked', () => {
      const path = '/my/path';
      sinon.stub(utils, 'navigateToHref');

      const button = setUpMessage.findOne('Button');
      button.props.onClick();

      expect(utils.navigateToHref).to.have.been.calledWith(path);

      utils.navigateToHref.restore();
    });
  });
  describe('custom behavior', () => {
    it('can have a solid border', () => {
      const setUpMessage = isolateComponent(
        <UnconnectedSetUpMessage {...defaultProps} solidBorder />
      );
      expect(setUpMessage.findAll('div')[0].props.style).to.contain({
        borderStyle: 'solid',
        borderWidth: 1
      });
    });
  });
});
