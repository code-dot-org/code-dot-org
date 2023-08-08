import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {isolateComponent} from 'isolate-react';
import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';
import Button from '@cdo/apps/templates/Button';

describe('BorderedCallToAction', () => {
  const headingText = 'Do Something';
  const descriptionText = 'Get started now';
  const buttonText = 'Get to it';
  const buttonUrl = '/my/path';
  const defaultProps = {
    headingText,
    descriptionText,
    buttonText,
    buttonUrl,
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

    it('renders a gray button with text', () => {
      const button = borderedCtA.findOne('Button');
      expect(button.props.text).to.equal(buttonText);
      expect(button.props.color).to.equal('brandSecondaryDefault');
    });

    it('has a dashed border', () => {
      expect(borderedCtA.findAll('div')[0].props.style).to.contain({
        borderStyle: 'dashed',
        borderWidth: 5,
      });
    });

    it('button goes to url when clicked', () => {
      const path = '/my/path';
      sinon.stub(utils, 'navigateToHref');

      const button = borderedCtA.findOne('Button');
      button.props.onClick();

      expect(utils.navigateToHref).to.have.been.calledWith(path);

      utils.navigateToHref.restore();
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
      expect(borderedCtA.findAll('div')[0].props.style).to.contain({
        borderStyle: 'solid',
        borderWidth: 1,
      });
    });

    it('can have a custom button color', () => {
      const borderedCtA = isolateComponent(
        <BorderedCallToAction
          {...defaultProps}
          buttonColor={Button.ButtonColor.brandSecondaryDefault}
        />
      );
      const button = borderedCtA.findOne('Button');
      expect(button.props.text).to.equal(buttonText);
      expect(button.props.color).to.equal('orange');
    });

    it('can use a custom onClick, which ignores buttonUrl', () => {
      const onClickSpy = sinon.spy();
      sinon.stub(utils, 'navigateToHref');
      const borderedCtA = isolateComponent(
        <BorderedCallToAction {...defaultProps} onClick={onClickSpy} />
      );

      const button = borderedCtA.findOne('Button');
      button.props.onClick();

      expect(utils.navigateToHref).not.to.have.been.called;
      expect(onClickSpy).to.have.been.calledOnce;

      utils.navigateToHref.restore();
    });
  });
});
