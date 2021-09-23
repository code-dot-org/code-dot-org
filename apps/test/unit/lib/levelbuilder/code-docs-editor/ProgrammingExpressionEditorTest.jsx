import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ProgrammingExpressionEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingExpressionEditor';

describe('ProgrammingExpressionEditor', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      initialProgrammingExpression: {
        id: 1,
        name: 'Block',
        key: 'block',
        shortDescription: 'This is a short description.'
      },
      videoOptions: [
        {
          key: 'video1',
          name: 'Video 1'
        },
        {
          key: 'video2',
          name: 'Video 2'
        }
      ]
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ProgrammingExpressionEditor {...defaultProps} />);
    expect(wrapper.contains('Editing Block')).to.be.true;

    // Display name
    expect(
      wrapper
        .find('input')
        .at(0)
        .props().value
    ).to.equal('Block');

    // Key
    expect(
      wrapper
        .find('input')
        .at(1)
        .props().value
    ).to.equal('block');
    expect(
      wrapper
        .find('input')
        .at(1)
        .props().readOnly
    ).to.be.true;

    // Video select
    expect(wrapper.find('option').length).to.equal(3);
    expect(wrapper.find('option').map(option => option.props().value)).to.eql([
      '',
      'video1',
      'video2'
    ]);

    // short description
    expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(1);
    expect(
      wrapper.find('TextareaWithMarkdownPreview').props().markdown
    ).to.equal('This is a short description.');
  });
});
