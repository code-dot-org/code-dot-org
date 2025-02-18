import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import EditTipDialog from '@cdo/apps/levelbuilder/lesson-editor/EditTipDialog';

describe('EditTipDialog', () => {
  let defaultProps, handleConfirm, handleDelete;
  beforeEach(() => {
    handleConfirm = jest.fn();
    handleDelete = jest.fn();
    defaultProps = {
      isOpen: true,
      handleConfirm,
      handleDelete,
      tip: {
        key: 'tip-1',
        type: 'teachingTip',
        markdown: '',
      },
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<EditTipDialog {...defaultProps} />);
    expect(wrapper.contains('Add Callout')).toBe(true);
    expect(wrapper.find('LessonTip').length).toBe(1);
    expect(wrapper.find('select').length).toBe(1);
    expect(wrapper.find('MarkdownEnabledTextarea').length).toBe(1);
    expect(wrapper.find('LessonEditorDialog').length).toBe(1);
  });

  it('edit tip values', () => {
    const wrapper = shallow(<EditTipDialog {...defaultProps} />);

    const dropdown = wrapper.find('select');
    expect(dropdown.props().value).toBe('teachingTip');
    dropdown.simulate('change', {target: {value: 'contentCorner'}});

    const textarea = wrapper.find('MarkdownEnabledTextarea');
    expect(textarea.props().markdown).toContain('');

    expect(wrapper.state().tip.type).toBe('contentCorner');
  });
});
