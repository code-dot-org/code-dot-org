// TODO: Uncomment and fix tests once ready
import React from 'react';
import {render, screen} from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import sinon from 'sinon';

import {expect} from '../../util/reconfiguredChai';

import Dropdown from '@cdo/apps/componentLibrary/dropdownMenu';
//
//
// {
//     name: 'default-dropdown',
//         items: [
//     {value: 'option-1', label: 'Option 1'},
//     {value: 'option-2', label: 'Option 2'},
// ],
//     onChange: args => console.log(args),
//     size: 'm',
// }
//

describe('Design System - Dropdown Select Component', () => {
  it('Dropdown Select - renders with correct text and options', () => {
    render(
      <Dropdown
        name="test-dropdown"
        items={[
          {value: 'option-1', label: 'option1'},
          {value: 'option-2', label: 'option2'},
          {value: 'option-3', label: 'option3'},
        ]}
      />
    );

    const label = screen.getByText('Dropdown label');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');
    const option3 = screen.getByText('option3');

    expect(label).to.exist;
    expect(option1).to.exist;
    expect(option2).to.exist;
    expect(option3).to.exist;
  });

  // it('SemgentedButtons - changes selected button on click', async () => {
  //   const user = userEvent.setup();
  //   const spyOnChange = sinon.spy();
  //   const onChange = value => {
  //     onSegmentedButtonsChange('label', value);
  //     spyOnChange(value);
  //   };
  //
  //   const {rerender} = render(
  //     <SegmentedButtons
  //       selectedButtonValue="label"
  //       buttons={[
  //         {label: 'Label', value: 'label'},
  //         {label: 'Label2', value: 'label-2'},
  //       ]}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   let segmentedButton1 = screen.getByText('Label');
  //   const segmentedButton2 = screen.getByText('Label2');
  //
  //   expect(segmentedButton1).to.exist;
  //   expect(segmentedButton2).to.exist;
  //   expect(valuesMap.label || 'label').to.equal('label');
  //
  //   await user.click(segmentedButton2);
  //
  //   // Re-render after user's first click
  //   rerender(
  //     <SegmentedButtons
  //       selectedButtonValue="label"
  //       buttons={[
  //         {label: 'Label', value: 'label'},
  //         {label: 'Label2', value: 'label-2'},
  //       ]}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   segmentedButton1 = screen.getByText('Label');
  //
  //   expect(spyOnChange).to.have.been.calledOnce;
  //   expect(spyOnChange).to.have.been.calledWith('label-2');
  //   expect(valuesMap.label).to.equal('label-2');
  //
  //   await user.click(segmentedButton1);
  //
  //   // Re-render after user's second click
  //   rerender(
  //     <SegmentedButtons
  //       selectedButtonValue="label"
  //       buttons={[
  //         {label: 'Label', value: 'label'},
  //         {label: 'Label2', value: 'label-2'},
  //       ]}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   expect(spyOnChange).to.have.been.calledTwice;
  //   expect(spyOnChange).to.have.been.calledWith('label');
  //   expect(valuesMap.label).to.equal('label');
  // });

  // it("SegmentedButtons - renders disabled button, doesn't change on click", async () => {
  //   const user = userEvent.setup();
  //   const spyOnChange = sinon.spy();
  //   const onChange = value => {
  //     onSegmentedButtonsChange('label', value);
  //     spyOnChange(value);
  //   };
  //
  //   // Initial render
  //   const {rerender} = render(
  //     <SegmentedButtons
  //       selectedButtonValue="label"
  //       buttons={[
  //         {label: 'Label', value: 'label'},
  //         {label: 'Label2', value: 'label-2', disabled: true},
  //       ]}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   let segmentedButton1 = screen.getByText('Label');
  //   const segmentedButton2 = screen.getByText('Label2');
  //
  //   expect(segmentedButton1).to.exist;
  //   expect(segmentedButton2).to.exist;
  //   expect(valuesMap.label || 'label').to.equal('label');
  //
  //   await user.click(segmentedButton2);
  //
  //   // Re-render after user's first click
  //   rerender(
  //     <SegmentedButtons
  //       selectedButtonValue="label"
  //       buttons={[
  //         {label: 'Label', value: 'label'},
  //         {label: 'Label2', value: 'label-2', disabled: true},
  //       ]}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   segmentedButton1 = screen.getByText('Label');
  //
  //   expect(spyOnChange).to.not.have.been.called;
  //   expect(valuesMap.label || 'label').to.equal('label');
  //
  //   await user.click(segmentedButton1);
  //
  //   // Re-render after user's second click
  //   rerender(
  //     <SegmentedButtons
  //       selectedButtonValue="label"
  //       buttons={[
  //         {label: 'Label', value: 'label'},
  //         {label: 'Label2', value: 'label-2', disabled: true},
  //       ]}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   expect(spyOnChange).to.have.been.called.once;
  //   expect(spyOnChange).to.have.been.calledWith('label');
  // });

  // it('Link - openInNewTab adds target attribute', () => {
  //   render(
  //     <Link href="https://studio.code.org/home" openInNewTab>
  //       Home
  //     </Link>
  //   );
  //
  //   const link = screen.getByRole('link', {name: 'Home'});
  //   expect(link).to.exist;
  //   expect(link.target).to.equal('_blank');
  //   expect(link.href).to.equal('https://studio.code.org/home');
  // });

  // it('Link - external adds rel attribute', () => {
  //   render(
  //     <Link href="https://studio.code.org/home" external>
  //       Home
  //     </Link>
  //   );
  //
  //   const link = screen.getByRole('link', {name: 'Home'});
  //   expect(link).to.exist;
  //   expect(link.rel).to.equal('noopener noreferrer');
  //   expect(link.href).to.equal('https://studio.code.org/home');
  // });

  // it('Link - onClick is correctly called when clicked', async () => {
  //   const user = userEvent.setup();
  //   const spyOnClick = sinon.spy();
  //
  //   const linkToRender = <Link onClick={spyOnClick}>Home</Link>;
  //
  //   const {rerender} = render(linkToRender);
  //
  //   await user.click(screen.getByText('Home'));
  //
  //   rerender(linkToRender);
  //
  //   expect(spyOnClick).to.have.been.calledOnce;
  // });

  // it('Link - doesn`t call onClick when disabled', async () => {
  //   const user = userEvent.setup();
  //   const spyOnClick = sinon.spy();
  //   const linkToRender = (
  //     <Link disabled onClick={spyOnClick}>
  //       Home
  //     </Link>
  //   );
  //   const {rerender} = render(linkToRender);
  //
  //   rerender(linkToRender);
  //
  //   await user.click(screen.getByText('Home'));
  //
  //   expect(spyOnClick).not.to.have.been.called;
  // });
});
