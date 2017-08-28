import React from 'react';
import { assert } from 'chai';
import { UnconnectedSectionSelector as SectionSelector } from
  '@cdo/apps/code-studio/components/progress/SectionSelector';
import { mount } from 'enzyme';

const fakeSection = {
  name: 'My Section',
  id: 123
};

describe('SectionSelector', () => {
  it('renders nothing if it has no sections', () => {
    const component = mount(
      <SectionSelector
        sections={[]}
        scriptHasLockableStages={true}
        scriptAllowsHiddenStages={true}
        selectSection={() => {}}
      />
    );
    assert(component.html() === null);
  });

  it('renders nothing if it has no lockable stages and no hidden stages', () => {
    const component = mount(
      <SectionSelector
        sections={[fakeSection]}
        scriptHasLockableStages={false}
        scriptAllowsHiddenStages={false}
        selectSection={() => {}}
      />
    );
    assert(component.html() === null);
  });

  it('renders something if we have lockable stages', () => {
    const component = mount(
      <SectionSelector
        sections={[fakeSection]}
        scriptHasLockableStages={true}
        scriptAllowsHiddenStages={false}
        selectSection={() => {}}
      />
    );
    assert(component.html() !== null);
  });

  it('renders something if we allow hidden stages', () => {
    const component = mount(
      <SectionSelector
        sections={[fakeSection]}
        scriptHasLockableStages={false}
        scriptAllowsHiddenStages={true}
        selectSection={() => {}}
      />
    );
    assert(component.html() !== null);
  });

  it('renders something if alwaysShow even if no lockable/hidden stages', () => {
    const component = mount(
      <SectionSelector
        alwaysShow={true}
        sections={[fakeSection]}
        scriptHasLockableStages={false}
        scriptAllowsHiddenStages={false}
        selectSection={() => {}}
      />
    );
    assert(component.html() !== null);
  });


});
