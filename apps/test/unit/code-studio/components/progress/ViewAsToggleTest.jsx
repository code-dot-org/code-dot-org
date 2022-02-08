import React from 'react';
import $ from 'jquery';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedViewAsToggle as ViewAsToggle} from '@cdo/apps/code-studio/components/progress/ViewAsToggle';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

const DEFAULT_PROPS = {
  viewAs: ViewType.Participant,
  changeViewType: () => {},
  logToFirehose: () => {}
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ViewAsToggle {...props} />);
};

describe('ViewAsToggle', () => {
  it('calls changeViewType when ToggleGroup changes', () => {
    const spy = sinon.spy();
    const wrapper = setUp({changeViewType: spy});
    expect(spy).not.to.have.been.called;

    wrapper.find('Connect(ToggleGroup)').prop('onChange')(ViewType.Instructor);
    expect(spy).to.have.been.calledOnce.and.calledWith(ViewType.Instructor);
  });

  describe('toggle hide-as-student', () => {
    let toggleSpy;
    beforeEach(() => {
      toggleSpy = sinon.spy($.fn, 'toggle');
    });

    afterEach(() => {
      $.fn.toggle.restore();
    });

    it('calls toggle(true) if viewAs=Instructor', async () => {
      setUp({viewAs: ViewType.Instructor});
      expect(toggleSpy).to.have.been.calledWith(true);
    });

    it('calls toggle(false) if viewAs=Participant', async () => {
      setUp({viewAs: ViewType.Participant});
      expect(toggleSpy).to.have.been.calledWith(false);
    });

    it('calls toggle(true) if viewAs is updated to Instructor from Participant', async () => {
      const wrapper = setUp({viewAs: ViewType.Participant});

      expect(toggleSpy).to.have.been.calledWith(false);

      wrapper.setProps({viewAs: ViewType.Instructor});

      expect(toggleSpy).to.have.been.calledWith(true);
    });
  });
});
