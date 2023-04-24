import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import AdvancedSettingToggles from '@cdo/apps/templates/sectionsRefresh/AdvancedSettingToggles';
import sinon from 'sinon';

describe('AdvancedSettingToggles', () => {
  it('renders PairProgramming and LockThisSection toggles to true and false as default respectively', () => {
    // Later we might want to set up helper sections to test all of these
    const wrapper = shallow(
      <AdvancedSettingToggles
        updateSection={() => {}}
        section={{pairingAllowed: true, restrictSection: false}}
      />
    );
    expect(
      wrapper.find('ToggleSwitch[id="uitest-pair-toggle"]').props().isToggledOn
    ).to.be.true;
    expect(
      wrapper.find('ToggleSwitch[id="uitest-lock-toggle"]').props().isToggledOn
    ).to.be.false;
  });

  it('renders Lesson Extras Toggle when available', () => {
    const wrapper = shallow(
      <AdvancedSettingToggles
        updateSection={() => {}}
        section={{
          pairingAllowed: true,
          restrictSection: false,
          ttsAutoplayEnabled: false,
          lessonExtras: true,
        }}
        assignedUnitLessonExtrasAvailable={true}
      />
    );
    expect(
      wrapper.find('ToggleSwitch[id="uitest-lesson-extras-toggle"]')
    ).to.have.lengthOf(1);
  });

  it('renders TTS Toggle when available', () => {
    const wrapper = shallow(
      <AdvancedSettingToggles
        updateSection={() => {}}
        section={{
          pairingAllowed: true,
          restrictSection: false,
          ttsAutoplayEnabled: false,
          lessonExtras: true,
        }}
        assignedUnitTextToSpeechEnabled={true}
      />
    );
    expect(
      wrapper.find('ToggleSwitch[id="uitest-tts-toggle"]')
    ).to.have.lengthOf(1);
  });

  it('renders TTS Toggle when available', () => {
    const wrapper = shallow(
      <AdvancedSettingToggles
        updateSection={() => {}}
        section={{
          pairingAllowed: true,
          restrictSection: false,
          ttsAutoplayEnabled: false,
          lessonExtras: true,
        }}
        assignedUnitTextToSpeechEnabled={true}
      />
    );
    expect(
      wrapper.find('ToggleSwitch[id="uitest-tts-toggle"]')
    ).to.have.lengthOf(1);
  });

  it('changes the status of pair programming setting when clicked', () => {
    let updateSection = sinon.fake();

    const wrapper = shallow(
      <AdvancedSettingToggles
        updateSection={updateSection}
        section={{
          pairingAllowed: true,
          restrictSection: false,
          ttsAutoplayEnabled: false,
          lessonExtras: true,
        }}
      />
    );
    const pairProgramming = wrapper
      .find('ToggleSwitch[id="uitest-pair-toggle"]')
      .at(0);
    pairProgramming.simulate('toggle', {preventDefault: () => {}});
    expect(updateSection).to.have.been.calledOnce;
    expect(updateSection).to.have.been.calledWith('pairingAllowed', false);
  });
});
