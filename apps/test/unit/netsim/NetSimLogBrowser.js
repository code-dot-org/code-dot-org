/** @file NetSimLogBrowser tests */
import React from 'react';
import {shallow} from 'enzyme';
import {spy} from 'sinon';
import {expect} from '../../util/deprecatedChai';
import NetSimLogBrowser from '@cdo/apps/netsim/NetSimLogBrowser';
import i18n from '@cdo/netsim/locale';

describe('NetSimLogBrowser', function() {
  it('renders warning-free with the least possible parameters', function() {
    let shallowResult = shallow(
      <NetSimLogBrowser
        i18n={i18n}
        setRouterLogMode={spy()}
        currentTrafficFilter="none"
        setTrafficFilter={spy()}
        headerFields={[]}
        logRows={[]}
        senderNames={[]}
      />
    );
    expect(shallowResult).not.to.be.empty;
  });
});
