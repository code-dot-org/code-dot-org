import Checkbox from '@code-dot-org/component-library/checkbox';
import Modal from '@code-dot-org/component-library/modal';
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
  const wrapper = shallow(<ImageUploadModal {...defaultProps} />);

  expect(wrapper.find(Modal).prop('primaryButtonProps').disabled).toBe(true);

  const content = shallow(wrapper.find(Modal).prop('customContent'));
  const checkboxes = content.find(Checkbox);
  checkboxes.at(0).prop('onChange')();
  checkboxes.at(1).prop('onChange')();

  expect(wrapper.find(Modal).prop('primaryButtonProps').disabled).toBe(false);
});

it('warning message requires PII checkbox to be checked to go forward for teachers', () => {
  const props = {
    ...defaultProps,
    isTeacher: true,
  };
  const wrapper = shallow(<ImageUploadModal {...props} />);

  expect(wrapper.find(Modal).prop('primaryButtonProps').disabled).toBe(true);

  const content = shallow(wrapper.find(Modal).prop('customContent'));
  content.find(Checkbox).at(0).prop('onChange')();

  expect(wrapper.find(Modal).prop('primaryButtonProps').disabled).toBe(false);
});
