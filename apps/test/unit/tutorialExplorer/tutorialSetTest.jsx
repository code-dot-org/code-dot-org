import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import Tutorial from '@cdo/apps/tutorialExplorer/tutorial';
import TutorialSet from '@cdo/apps/tutorialExplorer/tutorialSet';
import TutorialDetail from '@cdo/apps/tutorialExplorer/tutorialDetail';
import i18n from '@cdo/tutorialExplorer/locale';

const TUTORIAL_1 = {
  name: 'Tutorial 1',
  code: 'tutorial-1'
};

const TUTORIAL_2 = {
  name: 'Tutorial 2',
  code: 'tutorial-2'
};

const DEFAULT_PROPS = {
  tutorials: [],
  localeEnglish: true,
  disabledTutorials: [],
  grade: 'all'
};

describe('TutorialSet', () => {
  it('renders empty set of tutorials', () => {
    const wrapper = shallow(<TutorialSet {...DEFAULT_PROPS} />);
    const instance = wrapper.instance();
    expect(wrapper).to.containMatchingElement(
      <div>
        <TutorialDetail
          showing={false}
          item={null}
          closeClicked={instance.tutorialDetailClosed}
          localeEnglish={true}
          disabledTutorial={false}
          changeTutorial={instance.changeTutorial}
          grade="all"
        />
        <div>{i18n.tutorialSetNoTutorials()}</div>
      </div>
    );
  });

  it('renders non-empty set of tutorials', () => {
    const wrapper = shallow(
      <TutorialSet {...DEFAULT_PROPS} tutorials={[TUTORIAL_1, TUTORIAL_2]} />
    );
    const instance = wrapper.instance();
    expect(wrapper).to.containMatchingElement(
      <div>
        <TutorialDetail
          showing={false}
          item={null}
          closeClicked={instance.tutorialDetailClosed}
          localeEnglish={true}
          disabledTutorial={false}
          changeTutorial={instance.changeTutorial}
          grade="all"
        />
        <Tutorial
          item={TUTORIAL_1}
          key={TUTORIAL_1.code}
          tutorialClicked={
            wrapper
              .find(Tutorial)
              .at(0)
              .props().tutorialClicked
          }
        />
        <Tutorial
          item={TUTORIAL_2}
          key={TUTORIAL_2.code}
          tutorialClicked={
            wrapper
              .find(Tutorial)
              .at(1)
              .props().tutorialClicked
          }
        />
      </div>
    );
  });

  it('shows tutorial details when tutorial is clicked', () => {
    const wrapper = shallow(
      <TutorialSet {...DEFAULT_PROPS} tutorials={[TUTORIAL_1, TUTORIAL_2]} />
    );

    // Call the click callback directly.
    wrapper
      .find(Tutorial)
      .at(0)
      .props()
      .tutorialClicked();

    const instance = wrapper.instance();
    expect(wrapper).to.containMatchingElement(
      <TutorialDetail
        showing={true}
        item={TUTORIAL_1}
        closeClicked={instance.tutorialDetailClosed}
        localeEnglish={true}
        disabledTutorial={false}
        changeTutorial={instance.changeTutorial}
        grade="all"
      />
    );
  });

  it('closes tutorial details', () => {
    const wrapper = shallow(
      <TutorialSet {...DEFAULT_PROPS} tutorials={[TUTORIAL_1, TUTORIAL_2]} />
    );

    // First get into an open details state
    wrapper.setState({showingDetail: true, chosenItem: TUTORIAL_1});
    const instance = wrapper.instance();
    expect(wrapper).to.containMatchingElement(
      <TutorialDetail
        showing={true}
        item={TUTORIAL_1}
        closeClicked={instance.tutorialDetailClosed}
        localeEnglish={true}
        disabledTutorial={false}
        changeTutorial={instance.changeTutorial}
        grade="all"
      />
    );

    // Close details and make sure the component updates
    instance.tutorialDetailClosed();
    expect(wrapper).to.containMatchingElement(
      <TutorialDetail
        showing={false}
        item={null}
        closeClicked={instance.tutorialDetailClosed}
        localeEnglish={true}
        disabledTutorial={false}
        changeTutorial={instance.changeTutorial}
        grade="all"
      />
    );
  });

  it('can advance through tutorials', () => {
    const wrapper = shallow(
      <TutorialSet {...DEFAULT_PROPS} tutorials={[TUTORIAL_1, TUTORIAL_2]} />
    );

    // First get into an open details state
    wrapper.setState({showingDetail: true, chosenItem: TUTORIAL_1});
    const instance = wrapper.instance();
    expect(wrapper).to.containMatchingElement(
      <TutorialDetail
        showing={true}
        item={TUTORIAL_1}
        closeClicked={instance.tutorialDetailClosed}
        localeEnglish={true}
        disabledTutorial={false}
        changeTutorial={instance.changeTutorial}
        grade="all"
      />
    );

    // Advance to the next tutorial
    instance.changeTutorial(1);
    expect(wrapper).to.containMatchingElement(
      <TutorialDetail
        showing={true}
        item={TUTORIAL_2}
        closeClicked={instance.tutorialDetailClosed}
        localeEnglish={true}
        disabledTutorial={false}
        changeTutorial={instance.changeTutorial}
        grade="all"
      />
    );

    // Does not advance if there's no next tutorial
    instance.changeTutorial(1);
    expect(wrapper).to.containMatchingElement(
      <TutorialDetail
        showing={true}
        item={TUTORIAL_2}
        closeClicked={instance.tutorialDetailClosed}
        localeEnglish={true}
        disabledTutorial={false}
        changeTutorial={instance.changeTutorial}
        grade="all"
      />
    );
  });

  it('handles disabled tutorials', () => {
    const wrapper = shallow(
      <TutorialSet
        {...DEFAULT_PROPS}
        tutorials={[TUTORIAL_1, TUTORIAL_2]}
        disabledTutorials={[TUTORIAL_1.short_code]}
      />
    );

    // First get into an open details state
    wrapper.setState({showingDetail: true, chosenItem: TUTORIAL_1});
    const instance = wrapper.instance();
    expect(wrapper).to.containMatchingElement(
      <TutorialDetail
        showing={true}
        item={TUTORIAL_1}
        closeClicked={instance.tutorialDetailClosed}
        localeEnglish={true}
        disabledTutorial={true}
        changeTutorial={instance.changeTutorial}
        grade="all"
      />
    );
  });
});
