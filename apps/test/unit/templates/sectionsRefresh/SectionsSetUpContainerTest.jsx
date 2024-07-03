import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import * as utils from '@cdo/apps/code-studio/utils';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import * as windowUtils from '@cdo/apps/utils';



describe('SectionsSetUpContainer', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('renders an initial set up section form', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('SingleSectionSetUp').length).toBe(1);
  });

  it('renders headers and button', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('Heading1').length).toBe(1);
    expect(wrapper.find('Button').length).toBe(4);
    expect(wrapper.find('Button').last().props().text).toBe('Finish creating sections');
  });

  it('renders edit header and save button', () => {
    const wrapper = shallow(<SectionsSetUpContainer sectionToBeEdited={{}} />);

    expect(wrapper.find('Heading1').length).toBe(1);
    expect(wrapper.find('Button').length).toBe(3);
    expect(wrapper.find('Button').last().props().text).toBe('Save');
  });

  it('renders curriculum quick assign', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('CurriculumQuickAssign').length).toBe(1);
  });

  it('renders Child Account Policy Notice for US, student and email sections', () => {
    jest.spyOn(utils, 'queryParams').mockClear()
      .withArgs('loginType')
      .mockReturnValue('email').mockImplementation((...args) => {
      if (args[0] === 'participantType') {
        return 'student';
      }
    });

    const wrapper = shallow(<SectionsSetUpContainer userCountry={'US'} />);
    expect(wrapper.find('Connect(Notification)').exists()).toBe(true);
  });

  it('does not render Child Account Policy Notice when sections are not email', () => {
    jest.spyOn(utils, 'queryParams').mockClear()
      .withArgs('loginType')
      .mockReturnValue('word').mockImplementation((...args) => {
      if (args[0] === 'participantType') {
        return 'student';
      }
    });

    const wrapper = shallow(<SectionsSetUpContainer userCountry={'US'} />);
    expect(wrapper.find('Connect(Notification)').exists()).toBe(false);
  });

  it('does not render Child Account Policy Notice for country different that US', () => {
    jest.spyOn(utils, 'queryParams').mockClear()
      .withArgs('loginType')
      .mockReturnValue('email').mockImplementation((...args) => {
      if (args[0] === 'participantType') {
        return 'student';
      }
    });

    const wrapper = shallow(<SectionsSetUpContainer userCountry={'ES'} />);
    expect(wrapper.find('Connect(Notification)').exists()).toBe(false);
  });

  it('renders coteacher settings', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('InfoHelpTip').length).toBe(1);
  });

  it('updates caret direction when Add Coteachers is clicked', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('Button').at(0).props().icon).toBe('caret-right');
    wrapper
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('Button').at(0).props().icon).toBe('caret-down');
  });

  it('renders advanced settings', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    wrapper
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    expect(wrapper.find('AdvancedSettingToggles').length).toBe(1);
  });

  it('updates caret direction when Advanced Settings is clicked', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('Button').at(0).props().icon).toBe('caret-right');
    wrapper
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('Button').at(1).props().icon).toBe('caret-down');
  });

  it('validates the form when save is clicked', () => {
    const reportSpy = jest.fn();
    jest.spyOn(document, 'querySelector').mockClear().mockImplementation((...args) => {
      if (args[0] === '#sections-set-up-container') {
        return {
            checkValidity: () => {},
            reportValidity: reportSpy,
          };
      }
    });

    const wrapper = shallow(<SectionsSetUpContainer />);

    wrapper
      .find('Button')
      .last()
      .simulate('click', {preventDefault: () => {}});

    expect(reportSpy).toHaveBeenCalled().once;
  });

  it('makes an ajax request when save is clicked', async () => {
    jest.spyOn(document, 'querySelector').mockClear()
      .withArgs('#sections-set-up-container')
      .mockReturnValue({
        checkValidity: () => true,
      }).mockImplementation((...args) => {
      if (args[0] === 'meta[name="csrf-token"]') {
        return {
            attributes: {content: {value: null}},
          };
      }
    });
    const fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    fetchSpy.mockReturnValue(Promise.resolve({ok: true, json: () => {}}));
    const navigateToHrefSpy = jest.spyOn(windowUtils, 'navigateToHref').mockClear();

    const wrapper = shallow(<SectionsSetUpContainer />);

    wrapper
      .find('Button')
      .last()
      .simulate('click', {preventDefault: () => {}});

    expect(fetchSpy).toHaveBeenCalled().once;

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(navigateToHrefSpy).toHaveBeenCalled().once;
    expect(navigateToHrefSpy.mock.calls[0][0]).toContain('/home');
  });

  it('appends showSectionCreationDialog to url if isUsersFirstSection is true', async () => {
    jest.spyOn(document, 'querySelector').mockClear()
      .withArgs('#sections-set-up-container')
      .mockReturnValue({
        checkValidity: () => true,
      }).mockImplementation((...args) => {
      if (args[0] === 'meta[name="csrf-token"]') {
        return {
            attributes: {content: {value: null}},
          };
      }
    });
    const fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    fetchSpy.mockReturnValue(Promise.resolve({ok: true, json: () => {}}));
    const navigateToHrefSpy = jest.spyOn(windowUtils, 'navigateToHref').mockClear();

    const wrapper = shallow(<SectionsSetUpContainer isUsersFirstSection />);

    wrapper
      .find('Button')
      .last()
      .simulate('click', {preventDefault: () => {}});

    expect(fetchSpy).toHaveBeenCalled().once;

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(navigateToHrefSpy).toHaveBeenCalled().once;
    expect(navigateToHrefSpy.mock.calls[0][0]).toContain('/home?showSectionCreationDialog=true');
  });

  it('passes participantType and loginType to ajax request when save is clicked', () => {
    jest.spyOn(document, 'querySelector').mockClear()
      .withArgs('#sections-set-up-container')
      .mockReturnValue({
        checkValidity: () => true,
      }).mockImplementation((...args) => {
      if (args[0] === 'meta[name="csrf-token"]') {
        return {
            attributes: {content: {value: null}},
          };
      }
    });
    jest.spyOn(utils, 'queryParams').mockClear()
      .withArgs('loginType')
      .mockReturnValue('word').mockImplementation((...args) => {
      if (args[0] === 'participantType') {
        return 'student';
      }
    });
    const fetchSpy = jest.spyOn(window, 'fetch').mockClear();

    const wrapper = shallow(<SectionsSetUpContainer />);

    wrapper
      .find('Button')
      .last()
      .simulate('click', {preventDefault: () => {}});

    expect(fetchSpy).toHaveBeenCalled().once;
    const fetchBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(fetchBody.login_type).toBe('word');
    expect(fetchBody.participant_type).toBe('student');
  });

  it('passes url attribute to make a new section if save and create new is clicked', () => {
    jest.spyOn(document, 'querySelector').mockClear()
      .withArgs('#sections-set-up-container')
      .mockReturnValue({
        checkValidity: () => true,
      }).mockImplementation((...args) => {
      if (args[0] === 'meta[name="csrf-token"]') {
        return {
            attributes: {content: {value: null}},
          };
      }
    });
    jest.spyOn(utils, 'queryParams').mockClear().mockImplementation((...args) => {
      if (args[0] === 'showSectionCreationDialog') {
        return 'true';
      }
    });
    const fetchSpy = jest.spyOn(window, 'fetch').mockClear();

    const wrapper = shallow(<SectionsSetUpContainer />);

    const buttons = wrapper.find('Button');
    buttons
      .at(buttons.length - 2)
      .simulate('click', {preventDefault: () => {}});

    expect(fetchSpy).toHaveBeenCalled().once;
  });
});
