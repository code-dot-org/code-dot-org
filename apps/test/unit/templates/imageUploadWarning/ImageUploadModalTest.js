import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import ImageUploadModal from '@cdo/apps/templates/imageUploadWarning/ImageUploadModal';

const defaultProps = {
  isOpen: true,
  cancelUpload: () => {},
  confirmUploadWarning: () => {},
};

it('warning message requires both checkboxes to be checked to go forward', () => {
  const body = shallow(<ImageUploadModal {...defaultProps} />);

  let confirmButton = body.find('button').at(1);
  expect(confirmButton.props().disabled).to.be.true;
  const checkboxes = body.find('input');
  checkboxes.at(0).simulate('change', {target: {checked: true}});
  checkboxes.at(1).simulate('change', {target: {checked: true}});
  confirmButton = body.find('button').at(1);
  expect(confirmButton.props().disabled).to.be.false;
});
