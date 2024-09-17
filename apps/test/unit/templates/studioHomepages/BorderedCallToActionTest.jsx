import {isolateComponent} from 'isolate-react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {Button} from '@cdo/apps/componentLibrary/button';
import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('BorderedCallToAction', () => {
  const headingText = 'Do Something';
  const descriptionText = 'Get started now';
  const buttonText = 'Get to it';
  const buttonUrl = '/my/path';
  const buttonColor = 'purple';
  const defaultProps = {
    headingText,
    descriptionText,
    buttonText,
    buttonUrl,
    buttonColor,
  };

  describe('default behavior', () => {
    const borderedCtA = isolateComponent(
      <BorderedCallToAction {...defaultProps} />
    );

    it('renders a heading', () => {
      expect(borderedCtA.content()).contains(descriptionText);
    });

    it('renders a description', () => {
      expect(borderedCtA.content()).contains(descriptionText);
    });

    it('renders a purple button with text', () => {
      const button = borderedCtA.findOne(Button);
      expect(button.props.text).to.equal(buttonText);
      expect(button.props.color).to.equal(buttonColor);
    });

    it('has a dashed border', () => {
      expect(borderedCtA.findAll('div.dashedBorder'));
    });

    it('button goes to url when clicked', () => {
      const button = borderedCtA.findOne(Button);
      expect(button.props.href).contains(buttonUrl);
    });
  });

  describe('custom behavior', () => {
    it('must have either a buttonUrl or onClick', () => {
      expect(() => {
        isolateComponent(
          <BorderedCallToAction {...defaultProps} buttonUrl={undefined} />
        );
      }).to.throw(Error);
    });

    it('can have a solid border', () => {
      const borderedCtA = isolateComponent(
        <BorderedCallToAction {...defaultProps} solidBorder />
      );
      expect(borderedCtA.findAll('div.solidBorder'));
    });

    it('can have a custom button color', () => {
      const borderedCtA = isolateComponent(
        <BorderedCallToAction {...defaultProps} buttonColor={'black'} />
      );
      const button = borderedCtA.findOne(Button);
      expect(button.props.text).to.equal(buttonText);
      expect(button.props.color).to.equal('black');
    });

    it('can use a custom onClick', () => {
      const onClickSpy = sinon.spy();
      const borderedCtA = isolateComponent(
        <BorderedCallToAction {...defaultProps} onClick={onClickSpy} />
      );
      const button = borderedCtA.findOne(Button);
      button.props.onClick();
      expect(onClickSpy).to.have.been.calledOnce;
    });
  });
});
