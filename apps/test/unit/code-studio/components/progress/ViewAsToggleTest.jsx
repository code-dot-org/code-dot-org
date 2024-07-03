import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';

import {UnconnectedViewAsToggle as ViewAsToggle} from '@cdo/apps/code-studio/components/progress/ViewAsToggle';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';



const DEFAULT_PROPS = {
  viewAs: ViewType.Participant,
  changeViewType: () => {},
  logToFirehose: () => {},
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ViewAsToggle {...props} />);
};

describe('ViewAsToggle', () => {
  it('calls changeViewType when ToggleGroup changes', () => {
    const spy = jest.fn();
    const wrapper = setUp({changeViewType: spy});
    expect(spy).not.toHaveBeenCalled();

    wrapper.find('Connect(ToggleGroup)').prop('onChange')(ViewType.Instructor);
    expect(spy).toHaveBeenCalledWith(ViewType.Instructor);
  });

  describe('toggle hide-as-student', () => {
    let toggleSpy;
    beforeEach(() => {
      toggleSpy = jest.spyOn($.fn, 'toggle').mockClear();
    });

    afterEach(() => {
      $.fn.toggle.mockRestore();
    });

    it('calls toggle(true) if viewAs=Instructor', async () => {
      setUp({viewAs: ViewType.Instructor});
      expect(toggleSpy).toHaveBeenCalledWith(true);
    });

    it('calls toggle(false) if viewAs=Participant', async () => {
      setUp({viewAs: ViewType.Participant});
      expect(toggleSpy).toHaveBeenCalledWith(false);
    });

    it('calls toggle(true) if viewAs is updated to Instructor from Participant', async () => {
      const wrapper = setUp({viewAs: ViewType.Participant});

      expect(toggleSpy).toHaveBeenCalledWith(false);

      wrapper.setProps({viewAs: ViewType.Instructor});

      expect(toggleSpy).toHaveBeenCalledWith(true);
    });
  });
});
