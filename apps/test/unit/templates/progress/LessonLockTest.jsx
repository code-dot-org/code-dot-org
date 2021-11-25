import React from 'react';
import {expect} from '../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {UnconnectedLessonLock as LessonLock} from '@cdo/apps/templates/progress/LessonLock';
import LessonLockDialog from '@cdo/apps/code-studio/components/progress/LessonLockDialog';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

const FAKE_SECTION_ID = 'fake-section-id';
const FAKE_LESSON_ID = 33;
const FAKE_SCRIPT_ID = 1;
const DEFAULT_PROPS = {
  lesson: {
    name: '',
    id: FAKE_LESSON_ID,
    lockable: false,
    isFocusArea: false
  },
  sectionId: FAKE_SECTION_ID,
  sectionsAreLoaded: false,
  saving: false,
  scriptId: FAKE_SCRIPT_ID,
  openLockDialog: () => {},
  closeLockDialog: () => {},
  refetchSectionLockStatus: () => {}
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<LessonLock {...props} />);
};

describe('LessonLock', () => {
  it('renders a loading message before sections are loaded', () => {
    const wrapper = setUp();
    expect(wrapper).to.containMatchingElement(<div>{i18n.loading()}</div>);
  });

  it('renders a button and dialog after sections are loaded', () => {
    const wrapper = setUp({sectionsAreLoaded: true});

    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <Button
            __useDeprecatedTag
            color={Button.ButtonColor.gray}
            text={i18n.lockSettings()}
            icon="lock"
          />
        </div>
        <LessonLockDialog />
      </div>
    );
  });

  it('changes button text while saving', () => {
    const wrapper = setUp({sectionsAreLoaded: true, saving: true});

    expect(wrapper).to.containMatchingElement(
      <Button __useDeprecatedTag text={i18n.saving()} icon="lock" />
    );
  });

  it('hooks up callbacks correctly', () => {
    const openSpy = sinon.spy();
    const closeSpy = sinon.spy();
    const refetchSpy = sinon.spy();
    const wrapper = setUp({
      sectionsAreLoaded: true,
      openLockDialog: openSpy,
      closeLockDialog: closeSpy,
      refetchSectionLockStatus: refetchSpy
    });

    // Close callback gets passed through to the dialog unchanged.
    expect(wrapper).to.containMatchingElement(
      <LessonLockDialog handleClose={closeSpy} />
    );

    // Open callback gets called when button is clicked.
    wrapper
      .find(Button)
      .first()
      .props()
      .onClick();
    expect(openSpy).to.have.been.calledOnce.and.calledWith(
      FAKE_SECTION_ID,
      FAKE_LESSON_ID
    );
    expect(refetchSpy).to.have.been.calledOnce.and.calledWith(
      FAKE_SECTION_ID,
      FAKE_SCRIPT_ID
    );
  });
});
