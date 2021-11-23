import {expect} from '../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DisabledBubblesModal from '@cdo/apps/code-studio/DisabledBubblesModal';

describe('DisabledBubblesModal', () => {
  it('is open to begin with', () => {
    const wrapper = shallow(<DisabledBubblesModal />);
    expect(
      wrapper.containsMatchingElement(
        <BaseDialog isOpen={true} uncloseable={true}>
          <div>
            <div>{i18n.disabledProgress1()}</div>
            <div>{i18n.disabledProgress2()}</div>
            <div>{i18n.disabledProgress3()}</div>
            <div>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://support.code.org/hc/en-us/articles/115002660852"
              >
                {i18n.learnMore()}
              </a>
            </div>
            <div>
              <button type="button" onClick={wrapper.instance().handleClose}>
                {i18n.dialogOK()}
              </button>
            </div>
          </div>
        </BaseDialog>
      )
    ).to.be.true;
  });

  it('closes when the button is clicked', () => {
    const wrapper = shallow(<DisabledBubblesModal />);
    expect(wrapper.find(BaseDialog).prop('isOpen')).to.be.true;

    wrapper.find('button').simulate('click');
    expect(wrapper.find(BaseDialog).prop('isOpen')).to.be.false;
  });
});
