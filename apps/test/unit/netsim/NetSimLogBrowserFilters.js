/** @file Test of Log Browser Filters component. */
import _ from 'lodash';
import React from 'react';
import {shallow, mount} from 'enzyme';
import {spy} from 'sinon';
import {expect} from '../../util/deprecatedChai';
import NetSimLogBrowserFilters, {
  SentByDropdown
} from '@cdo/apps/netsim/NetSimLogBrowserFilters';
import i18n from '@cdo/netsim/locale';

describe('NetSimLogBrowserFilters', function() {
  describe('Student View', function() {
    it('does not show sent-by dropdown', function() {
      expect(
        shallowWithDefaults({
          teacherView: false
        })
      ).not.to.have.descendants(SentByDropdown);
    });
  });

  describe('Teacher View', function() {
    it('shows sent-by dropdown', function() {
      const setSentByFilter = spy();
      const senderNames = [];
      expect(
        shallowWithDefaults({
          teacherView: true,
          setSentByFilter,
          senderNames
        })
      ).to.contain(
        <SentByDropdown
          i18n={i18n}
          currentSentByFilter="none"
          setSentByFilter={setSentByFilter}
          senderNames={senderNames}
        />
      );
    });
  });

  function shallowWithDefaults(props) {
    return shallow(
      <NetSimLogBrowserFilters
        i18n={i18n}
        setRouterLogMode={spy()}
        currentTrafficFilter="none"
        setTrafficFilter={spy()}
        currentSentByFilter="none"
        setSentByFilter={spy()}
        logRows={[]}
        senderNames={[]}
        {...props}
      />
    );
  }
});

describe('SentByDropdown', function() {
  it('is populated by sent-by names from log rows', function() {
    const result = mountWithLogRows([{'sent-by': 'Alice'}, {'sent-by': 'Bob'}]);
    expect(result).to.contain(
      <option value="by Alice">
        {i18n.logBrowserHeader_sentByName({name: 'Alice'})}
      </option>
    );
    expect(result).to.contain(
      <option value="by Bob">
        {i18n.logBrowserHeader_sentByName({name: 'Bob'})}
      </option>
    );
  });

  it('only shows each name once', function() {
    const result = mountWithLogRows([
      {'sent-by': 'Alice'},
      {'sent-by': 'Alice'},
      {'sent-by': 'Bob'},
      {'sent-by': 'Bob'},
      {'sent-by': 'Bob'}
    ]);
    expect(result.find('option[value="by Alice"]')).to.have.length(1);
    expect(result.find('option[value="by Bob"]')).to.have.length(1);
  });

  it('includes the "anyone" option', function() {
    const result = mountWithLogRows([{'sent-by': 'Alice'}, {'sent-by': 'Bob'}]);
    expect(result).to.contain(
      <option value="none">{i18n.logBrowserHeader_sentByAnyone()}</option>
    );
  });

  it('provides only the "anyone" option if there are no log rows', function() {
    const result = mountWithLogRows([]);
    expect(result).to.contain(
      <option value="none">{i18n.logBrowserHeader_sentByAnyone()}</option>
    );
    expect(result.find('option')).to.have.length(1);
  });

  function mountWithLogRows(logRows) {
    const senderNames = _.uniq(logRows.map(row => row['sent-by']));
    return mount(
      <SentByDropdown
        i18n={i18n}
        currentSentByFilter="none"
        setSentByFilter={spy()}
        logRows={logRows}
        senderNames={senderNames}
      />
    );
  }
});
