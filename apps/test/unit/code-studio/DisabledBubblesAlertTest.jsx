import {expect} from '../../util/configuredChai';
import sinon from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import i18n from '@cdo/locale';
import Alert from '@cdo/apps/templates/alert';
import DisabledBubblesAlert from '@cdo/apps/code-studio/DisabledBubblesAlert';

describe('DisabledBubblesAlert', () => {
  beforeEach(() => {
    sinon.stub(sessionStorage, 'getItem');
    sinon.stub(sessionStorage, 'setItem');
  });

  afterEach(() => {
    sessionStorage.setItem.restore();
    sessionStorage.getItem.restore();
  });

  it('is visible at first, if not seen before', () => {
    sessionStorage.getItem.withArgs('disabledBubblesAlertSeen').returns(false);
    const wrapper = shallow(
      <DisabledBubblesAlert/>
    );
    expect(wrapper).to.containMatchingElement(
      <Alert
        type={'error'}
        onClose={wrapper.instance().onClose}
      >
        <div>
          <span>{i18n.disabledButtonsWarning() + ' '}</span>
          <span>{i18n.disabledButtonsInfo() + ' '}</span>
          <a
            href="https://support.code.org/hc/en-us/articles/115002660852"
            target="_blank"
          >
            {i18n.learnMore()}
          </a>
        </div>
      </Alert>
    );
  });

  it('is hidden at first, if seen before', () => {
    sessionStorage.getItem.withArgs('disabledBubblesAlertSeen').returns(true);
    const wrapper = shallow(
      <DisabledBubblesAlert/>
    );
    expect(wrapper).to.be.empty;
  });

  it('hides and remembers that the alert was seen when closed', () => {
    sessionStorage.getItem.withArgs('disabledBubblesAlertSeen').returns(false);
    const wrapper = shallow(
      <DisabledBubblesAlert/>
    );
    expect(wrapper).not.to.be.empty;

    // Call whatever close handler we passed to the alert
    wrapper.find(Alert).prop('onClose')();

    expect(wrapper).to.be.empty;
    expect(sessionStorage.setItem).to.have.been.calledWith('disabledBubblesAlertSeen', true);
  });
});
