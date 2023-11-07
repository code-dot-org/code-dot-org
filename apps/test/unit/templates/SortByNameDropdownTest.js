import $ from 'jquery';
import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import {UnconnectedSortByNameDropdown} from '@cdo/apps/templates/SortByNameDropdown';
import sinon from 'sinon';

describe('SortByNameDropdown', () => {
  it('renders dropdown', () => {
    const wrapper = mount(
      <UnconnectedSortByNameDropdown
        isSortedByFamilyName={false}
        setSortByFamilyName={() => {}}
      />
    );
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('select').props().value).to.equal('displayName');
  });
  it('renders dropdown with family name selected', () => {
    const wrapper = mount(
      <UnconnectedSortByNameDropdown
        isSortedByFamilyName={true}
        setSortByFamilyName={() => {}}
      />
    );
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('select').props().value).to.equal('familyName');
  });

  it("saves the sort mode setting to the user's preferences", () => {
    const sectionId = 1;
    const unitName = 'course1';
    const source = 'TeacherPanel';

    sinon.spy($, 'post');

    const setSortSpy = sinon.spy();

    const wrapper = mount(
      <UnconnectedSortByNameDropdown
        sectionId={sectionId}
        unitName={unitName}
        source={source}
        isSortedByFamilyName={false}
        setSortByFamilyName={setSortSpy}
      />
    );

    expect(wrapper.find('select').props().value).to.equal('displayName');

    wrapper.find('select').simulate('change', {target: {value: 'familyName'}});

    expect($.post).to.have.been.calledOnceWith(
      '/api/v1/users/me/sort_by_family_name',
      {
        sort_by_family_name: true,
      }
    );
    expect(setSortSpy).to.have.been.calledOnce;
    $.post.restore();
  });
});
