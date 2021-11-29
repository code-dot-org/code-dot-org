import React from 'react';
import {shallow} from 'enzyme';
import CloneLessonDialog from '@cdo/apps/lib/levelbuilder/unit-editor/CloneLessonDialog';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';

describe('CloneLessonDialog', () => {
  let defaultProps, handleCloseSpy, fetchSpy;

  beforeEach(() => {
    handleCloseSpy = sinon.spy();
    fetchSpy = sinon.stub(window, 'fetch');
    defaultProps = {
      lessonId: 1,
      lessonName: 'lesson-1',
      handleClose: handleCloseSpy
    };
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('disables clone button while saving', () => {
    fetchSpy.resolves();
    const wrapper = shallow(<CloneLessonDialog {...defaultProps} />);
    wrapper
      .find('Button')
      .at(1)
      .simulate('click');
    expect(
      wrapper
        .find('Button')
        .at(1)
        .props().disabled
    ).to.be.true;
  });

  it('can display success message on clone', () => {
    const wrapper = shallow(<CloneLessonDialog {...defaultProps} />);
    let returnData = {
      editLessonUrl: '/lessons/1/edit',
      editScriptUrl: '/s/test-script/edit'
    };
    fetchSpy
      .withArgs('/lessons/1/clone')
      .returns(Promise.resolve({ok: true, json: () => returnData}));
    return wrapper
      .instance()
      .onCloneClick()
      .then(() => {
        const successMessage = wrapper.find('span');
        expect(successMessage.text().includes('Clone succeeded!')).to.be.true;
        expect(
          successMessage
            .find('a')
            .map(a => a.props().href)
            .sort()
        ).to.eql(['/lessons/1/edit', '/s/test-script/edit'].sort());
      });
  });

  it('displays error message on failed clone', () => {
    const wrapper = shallow(<CloneLessonDialog {...defaultProps} />);
    let returnData = {
      error: 'Error message.'
    };
    fetchSpy
      .withArgs('/lessons/1/clone')
      .returns(Promise.resolve({ok: false, json: () => returnData}));
    return wrapper
      .instance()
      .onCloneClick()
      .then(() => {
        const errorMessage = wrapper.find('span');
        expect(errorMessage.text().includes('Error message.')).to.be.true;
      });
  });
});
