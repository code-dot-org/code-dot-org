// TODO: Uncomment and fix tests once ready
// import React from 'react';
// import {render, screen} from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import sinon from 'sinon';
//
// import {expect} from '../../util/reconfiguredChai';
//
// import Link from '@cdo/apps/componentLibrary/link';
//
// describe('Design System - Link', () => {
//   it('Link - renders with correct text', () => {
//     render(<Link href="https://studio.code.org/home">Home</Link>);
//
//     const link = screen.getByRole('link', {name: 'Home'});
//     expect(link).to.exist;
//     expect(link.href).to.equal('https://studio.code.org/home');
//   });
//
//   it('Link - openInNewTab adds target attribute', () => {
//     render(
//       <Link href="https://studio.code.org/home" openInNewTab>
//         Home
//       </Link>
//     );
//
//     const link = screen.getByRole('link', {name: 'Home'});
//     expect(link).to.exist;
//     expect(link.target).to.equal('_blank');
//     expect(link.href).to.equal('https://studio.code.org/home');
//   });
//
//   it('Link - external adds rel attribute', () => {
//     render(
//       <Link href="https://studio.code.org/home" external>
//         Home
//       </Link>
//     );
//
//     const link = screen.getByRole('link', {name: 'Home'});
//     expect(link).to.exist;
//     expect(link.rel).to.equal('noopener noreferrer');
//     expect(link.href).to.equal('https://studio.code.org/home');
//   });
//
//   it('Link - onClick is correctly called when clicked', async () => {
//     const user = userEvent.setup();
//     const spyOnClick = sinon.spy();
//
//     const linkToRender = <Link onClick={spyOnClick}>Home</Link>;
//
//     const {rerender} = render(linkToRender);
//
//     await user.click(screen.getByText('Home'));
//
//     rerender(linkToRender);
//
//     expect(spyOnClick).to.have.been.calledOnce;
//   });
//
//   it('Link - doesn`t call onClick when disabled', async () => {
//     const user = userEvent.setup();
//     const spyOnClick = sinon.spy();
//     const linkToRender = (
//       <Link disabled onClick={spyOnClick}>
//         Home
//       </Link>
//     );
//     const {rerender} = render(linkToRender);
//
//     rerender(linkToRender);
//
//     await user.click(screen.getByText('Home'));
//
//     expect(spyOnClick).not.to.have.been.called;
//   });
// });
