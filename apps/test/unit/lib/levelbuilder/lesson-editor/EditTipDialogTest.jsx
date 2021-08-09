import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import EditTipDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/EditTipDialog';
import sinon from 'sinon';

describe('EditTipDialog', () => {
  let defaultProps, handleConfirm, handleDelete;
  beforeEach(() => {
    handleConfirm = sinon.spy();
    handleDelete = sinon.spy();
    defaultProps = {
      isOpen: true,
      handleConfirm,
      handleDelete,
      tip: {
        key: 'tip-1',
        type: 'teachingTip',
        markdown: ''
      }
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<EditTipDialog {...defaultProps} />);
    expect(wrapper.contains('Add Callout')).to.be.true;
    expect(wrapper.find('LessonTip').length).to.equal(1);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('MarkdownEnabledTextarea').length).to.equal(1);
    expect(wrapper.find('LessonEditorDialog').length).to.equal(1);
  });

  it('edit tip values', () => {
    const wrapper = shallow(<EditTipDialog {...defaultProps} />);

    const dropdown = wrapper.find('select');
    expect(dropdown.props().value).to.equal('teachingTip');
    dropdown.simulate('change', {target: {value: 'contentCorner'}});

    const textarea = wrapper.find('MarkdownEnabledTextarea');
    expect(textarea.props().markdown).to.include('');

    expect(wrapper.state().tip.type).to.equal('contentCorner');
  });
});
