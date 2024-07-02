// import {fireEvent, render, screen} from '@testing-library/react';
// import React from 'react';
// import sinon from 'sinon';

// import ComingSoonBanner from '@cdo/apps/templates/sectionProgressV2/ComingSoonBanner';
// import * as utils from '@cdo/apps/utils';

// import {expect} from '../../../util/reconfiguredChai';

// describe('ComingSoonBanner', () => {
//   const renderDefault = (propOverrides = {}) => {
//     render(<ComingSoonBanner canShow={true} {...propOverrides} />);
//   };

//   it('renders correctly', () => {
//     renderDefault();
//     expect(screen.queryByRole('alert')).to.be.visible;
//     expect(screen.getByText('Coming Soon!')).to.be.visible;
//     expect(
//       screen.getByText(
//         "Our next update will add information about students' time spent and most recent activity date."
//       )
//     ).to.be.visible;
//     expect(screen.getByRole('button', {type: 'close'})).to.be.visible;
//   });

//   it('does not render if canShow prop is false', () => {
//     render(<ComingSoonBanner canShow={false} />);

//     expect(screen.queryByText('Coming Soon!')).to.not.exist;
//     expect(screen.queryByRole('alert')).to.not.exist;
//   });

//   it('does not render if local storage already closed', () => {
//     const getLocalStub = sinon
//       .stub(utils, 'tryGetLocalStorage')
//       .returns('true');
//     renderDefault();

//     expect(getLocalStub).to.be.calledOnce;
//     expect(screen.queryByText('Coming Soon!')).to.not.exist;
//     expect(screen.queryByRole('alert')).to.not.exist;

//     getLocalStub.restore();
//   });

//   it('closes banner when close button is clicked', () => {
//     const setLocalStub = sinon.stub(utils, 'trySetLocalStorage');
//     renderDefault();

//     const closeButton = screen.getByRole('button', {type: 'close'});
//     fireEvent.click(closeButton);

//     expect(setLocalStub).to.be.calledOnce;
//     expect(screen.queryByText('Coming Soon!')).to.not.exist;
//     expect(screen.queryByRole('alert')).to.not.exist;

//     setLocalStub.restore();
//   });
// });
