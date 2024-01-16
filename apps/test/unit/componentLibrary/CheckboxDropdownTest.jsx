// import React from 'react';
// import {render, screen} from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import sinon from 'sinon';
//
// import {expect} from '../../util/reconfiguredChai';
//
// import Dropdown from '@cdo/apps/componentLibrary/dropdownMenu';
//
// const valuesMap = {};
// const onDropdownChange = (name, value) => (valuesMap[name] = value);
//
// describe('Design System - Dropdown Select Component', () => {
//   it('Dropdown Select - renders with correct text and options', () => {
//     render(
//       <Dropdown
//         name="test1-dropdown"
//         items={[
//           {value: 'option-1', label: 'option1'},
//           {value: 'option-2', label: 'option2'},
//           {value: 'option-3', label: 'option3'},
//         ]}
//         selectedValue={valuesMap['test1-dropdown']}
//         onChange={e => onDropdownChange('test1-dropdown', e.target.value)}
//         labelText="Dropdown label"
//       />
//     );
//
//     const label = screen.getByText('Dropdown label');
//     const option1 = screen.getByText('option1');
//     const option2 = screen.getByText('option2');
//     const option3 = screen.getByText('option3');
//
//     expect(label).to.exist;
//     expect(option1).to.exist;
//     expect(option2).to.exist;
//     expect(option3).to.exist;
//   });
//
//   it('Dropdown Select - renders with correct text and options, changes selected value on when one is selected', async () => {
//     const user = userEvent.setup();
//     const spyOnChange = sinon.spy();
//     // set dropdown default value
//     onDropdownChange('test2-dropdown', '');
//     const onChange = e => {
//       onDropdownChange('test2-dropdown', e.target.value);
//       spyOnChange(e.target.value);
//     };
//     const DropdownToRender = () => (
//       <Dropdown
//         name="test2-dropdown"
//         items={[
//           {value: 'option-1', label: 'option1'},
//           {value: 'option-2', label: 'option2'},
//           {value: 'option-3', label: 'option3'},
//         ]}
//         selectedValue={valuesMap['test2-dropdown']}
//         onChange={onChange}
//         labelText="Dropdown2 label"
//       />
//     );
//
//     const {rerender} = render(<DropdownToRender />);
//
//     const label = screen.getByText('Dropdown2 label');
//     const selectElement = screen.getByRole('combobox');
//     const option1 = screen.getByText('option1');
//     const option2 = screen.getByText('option2');
//
//     expect(label).to.exist;
//     expect(selectElement).to.exist;
//     expect(option1).to.exist;
//     expect(option2).to.exist;
//     expect(valuesMap['test2-dropdown']).to.equal('');
//
//     await user.selectOptions(selectElement, 'option-1');
//
//     rerender(<DropdownToRender />);
//
//     expect(spyOnChange).to.have.been.calledOnce;
//     expect(spyOnChange).to.have.been.calledWith('option-1');
//     expect(valuesMap['test2-dropdown']).to.equal('option-1');
//
//     await user.selectOptions(selectElement, 'option-2');
//
//     rerender(<DropdownToRender />);
//
//     expect(spyOnChange).to.have.been.calledTwice;
//     expect(spyOnChange).to.have.been.calledWith('option-2');
//     expect(valuesMap['test2-dropdown']).to.equal('option-2');
//   });
//
//   it("Dropdown Select - renders disabled dropdown, doesn't change on click", async () => {
//     const user = userEvent.setup();
//     const spyOnChange = sinon.spy();
//     // set dropdown default value
//     onDropdownChange('test2-dropdown', '');
//     const onChange = e => {
//       onDropdownChange('test2-dropdown', e.target.value);
//       spyOnChange(e.target.value);
//     };
//
//     const DropdownToRender = () => (
//       <Dropdown
//         name="test2-dropdown"
//         disabled={true}
//         items={[
//           {value: 'option-1', label: 'option1'},
//           {value: 'option-2', label: 'option2'},
//           {value: 'option-3', label: 'option3'},
//         ]}
//         selectedValue={valuesMap['test2-dropdown']}
//         onChange={onChange}
//         labelText="Dropdown2 label"
//       />
//     );
//
//     const {rerender} = render(<DropdownToRender />);
//
//     const label = screen.getByText('Dropdown2 label');
//     const selectElement = screen.getByRole('combobox');
//     const option1 = screen.getByText('option1');
//     const option2 = screen.getByText('option2');
//
//     expect(label).to.exist;
//     expect(selectElement).to.exist;
//     expect(option1).to.exist;
//     expect(option2).to.exist;
//     expect(valuesMap['test2-dropdown']).to.equal('');
//
//     await user.selectOptions(selectElement, 'option-1');
//
//     rerender(<DropdownToRender />);
//
//     expect(spyOnChange).to.have.not.been.called;
//     expect(valuesMap['test2-dropdown']).to.equal('');
//
//     await user.selectOptions(selectElement, 'option-2');
//
//     rerender(<DropdownToRender />);
//
//     expect(spyOnChange).to.have.not.been.called;
//     expect(valuesMap['test2-dropdown']).to.equal('');
//   });
// });
