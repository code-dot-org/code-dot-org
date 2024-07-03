import {isolateComponent} from 'isolate-react';
import React from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';



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
      expect(borderedCtA.content()).toContain(descriptionText);
    });

    it('renders a description', () => {
      expect(borderedCtA.content()).toContain(descriptionText);
    });

    it('renders a purple button with text', () => {
      const button = borderedCtA.findOne(Button);
      expect(button.props.text).toBe(buttonText);
      expect(button.props.color).toBe(buttonColor);
    });

    it('has a dashed border', () => {
      expect(borderedCtA.findAll('div.dashedBorder'));
    });

    it('button goes to url when clicked', () => {
      const button = borderedCtA.findOne(Button);
      expect(button.props.href).toEqual(expect.arrayContaining([buttonUrl]));
    });
  });

  describe('custom behavior', () => {
    it('must have either a buttonUrl or onClick', () => {
      expect(() => {
        isolateComponent(
          <BorderedCallToAction {...defaultProps} buttonUrl={undefined} />
        );
      }).toThrow(Error);
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
      expect(button.props.text).toBe(buttonText);
      expect(button.props.color).toBe('black');
    });

    it('can use a custom onClick', () => {
      const onClickSpy = jest.fn();
      const borderedCtA = isolateComponent(
        <BorderedCallToAction {...defaultProps} onClick={onClickSpy} />
      );
      const button = borderedCtA.findOne(Button);
      button.props.onClick();
      expect(onClickSpy).toHaveBeenCalledTimes(1);
    });
  });
});
