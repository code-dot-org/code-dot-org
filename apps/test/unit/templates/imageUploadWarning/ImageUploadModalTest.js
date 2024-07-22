import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ImageUploadModal from '@cdo/apps/templates/imageUploadWarning/ImageUploadModal';

const defaultProps = {
  isOpen: true,
  cancelUpload: () => {},
  isTeacher: false,
  confirmUploadWarning: () => {},
};

it('warning message requires both checkboxes to be checked to go forward for students', () => {
  const body = shallow(<ImageUploadModal {...defaultProps} />);

  let confirmButton = body.find('button').at(1);
  expect(confirmButton.props().disabled).toBe(true);
  const checkboxes = body.find('input');
  checkboxes.at(0).simulate('change', {target: {checked: true}});
  checkboxes.at(1).simulate('change', {target: {checked: true}});
  confirmButton = body.find('button').at(1);
  expect(confirmButton.props().disabled).toBe(false);
});

it('warning message requires PII checkbox to be checked to go forward for teachers', () => {
  const props = {
    ...defaultProps,
    isTeacher: true,
  };
  const body = shallow(<ImageUploadModal {...props} />);

  let confirmButton = body.find('button').at(1);
  expect(confirmButton.props().disabled).toBe(true);
  const checkboxes = body.find('input');
  checkboxes.at(0).simulate('change', {target: {checked: true}});
  confirmButton = body.find('button').at(1);
  expect(confirmButton.props().disabled).toBe(false);
});
