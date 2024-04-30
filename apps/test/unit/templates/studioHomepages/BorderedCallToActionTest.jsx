import {render, screen} from '@testing-library/react';
import React from 'react';
// import sinon from 'sinon';

import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';

import {expect} from '../../../util/reconfiguredChai';

const DEFAULT_PROPS = {
  headingText: 'Do Something',
  descriptionText: 'Get started now',
  className: '',
  buttonType: 'primary',
  buttonText: 'Get to it',
  buttonUrl: '/my/path',
  buttonClass: '',
  buttonColor: 'purple',
  solidBorder: false,
  useAsLink: false,
};

describe('BorderedCallToAction', () => {
  function renderDefault(propOverrides = {}) {
    render(<BorderedCallToAction {...DEFAULT_PROPS} {...propOverrides} />);
  }

  it('renders a heading', () => {
    renderDefault();
    screen.getByText('Do Something');
  });

  it('renders a description', () => {
    renderDefault();
    screen.getByText('Get started now');
  });

  it('renders a button with text', () => {
    renderDefault();
    screen.getByText('Get to it');
  });

  it('has a dashed border', () => {
    renderDefault();
    screen.debug();
    const container = document.querySelector('#bordered-call-to-action');
    expect(container.classList.contains('dashedBorder')).toBe(true);
  });

  // it('button goes to url when clicked', () => {
  //   const path = '/my/path';
  //   sinon.stub(utils, 'navigateToHref');

  //   const button = borderedCtA.findOne('Button');
  //   button.props.onClick();

  //   expect(utils.navigateToHref).to.have.been.calledWith(path);

  //   utils.navigateToHref.restore();
  // });
});

// describe('custom behavior', () => {
//   it('must have either a buttonUrl or onClick', () => {
//     expect(() => {
//       isolateComponent(
//         <BorderedCallToAction {...defaultProps} buttonUrl={undefined} />
//       );
//     }).to.throw(Error);
//   });

//   it('can have a solid border', () => {
//     const borderedCtA = isolateComponent(
//       <BorderedCallToAction {...defaultProps} solidBorder />
//     );
//     expect(borderedCtA.findAll('div.solidBorder'));
//   });

//   it('can have a custom button color', () => {
//     const borderedCtA = isolateComponent(
//       <BorderedCallToAction {...defaultProps} buttonColor={'black'} />
//     );
//     const button = borderedCtA.findOne('Button');
//     expect(button.props.text).to.equal(buttonText);
//     expect(button.props.color).to.equal('black');
//   });

// it('can use a custom onClick, which ignores buttonUrl', () => {
//   const onClickSpy = sinon.spy();
//   sinon.stub(utils, 'navigateToHref');
//   const borderedCtA = isolateComponent(
//     <BorderedCallToAction {...defaultProps} onClick={onClickSpy} />
//   );

//   const button = borderedCtA.findOne('Button');
//   button.props.onClick();

//   expect(utils.navigateToHref).not.to.have.been.called;
//   expect(onClickSpy).to.have.been.calledOnce;

//   utils.navigateToHref.restore();
// });
// });
