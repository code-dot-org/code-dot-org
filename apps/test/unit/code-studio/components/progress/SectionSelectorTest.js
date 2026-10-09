import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  UnconnectedSectionSelector as SectionSelector,
  NO_SELECTED_SECTION_VALUE,
} from '@cdo/apps/code-studio/components/progress/SectionSelector';
import * as codeStudioUtils from '@cdo/apps/code-studio/utils';
import * as utils from '@cdo/apps/utils';

import {assert, expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const fakeSection = {
  name: 'My Section',
  id: 123,
};

const otherSection = {
  name: 'My Other Section',
  id: 456,
};

const testSectionId = 11;

describe('SectionSelector', () => {
  it('renders nothing if it has no sections', () => {
    const component = mount(
      <SectionSelector
        sections={[]}
        unitHasLockableLessons={true}
        unitAllowsHiddenLessons={true}
        selectSection={() => {}}
      />
    );
    assert(component.html() === null);
  });

  it('renders something if we have lockable lessons', () => {
    const component = mount(
      <SectionSelector
        sections={[fakeSection]}
        unitHasLockableLessons={true}
        unitAllowsHiddenLessons={false}
        selectSection={() => {}}
      />
    );
    assert(component.html() !== null);
  });

  it('renders something if we allow hidden lessons', () => {
    const component = mount(
      <SectionSelector
        sections={[fakeSection]}
        unitHasLockableLessons={false}
        unitAllowsHiddenLessons={true}
        selectSection={() => {}}
      />
    );
    assert(component.html() !== null);
  });

  it('renders something if alwaysShow even if no lockable/hidden lessons', () => {
    const component = mount(
      <SectionSelector
        alwaysShow={true}
        sections={[fakeSection]}
        unitHasLockableLessons={false}
        unitAllowsHiddenLessons={false}
        selectSection={() => {}}
      />
    );
    assert(component.html() !== null);
  });

  describe('handleSelectChange', () => {
    beforeEach(() => {
      sinon.stub(utils, 'reload');
      sinon.stub(codeStudioUtils, 'updateQueryParam');
    });

    afterEach(() => {
      codeStudioUtils.updateQueryParam.restore();
      utils.reload.restore();
    });

    it('updates the query param if a section is selected', () => {
      const wrapper = mount(
        <SectionSelector
          alwaysShow={true}
          sections={[fakeSection]}
          unitHasLockableLessons={false}
          unitAllowsHiddenLessons={false}
          selectSection={() => {}}
        />
      );
      wrapper
        .find('select')
        .simulate('change', {target: {value: testSectionId}});
      expect(codeStudioUtils.updateQueryParam)
        .to.have.been.calledTwice.and.calledWith('section_id', testSectionId)
        .and.calledWith('user_id', undefined);
    });

    it('removes the query param if a section is unselected', () => {
      const wrapper = mount(
        <SectionSelector
          alwaysShow={true}
          sections={[fakeSection]}
          unitHasLockableLessons={false}
          unitAllowsHiddenLessons={false}
          selectSection={() => {}}
        />
      );
      wrapper
        .find('select')
        .simulate('change', {target: {value: NO_SELECTED_SECTION_VALUE}});
      expect(codeStudioUtils.updateQueryParam)
        .to.have.been.calledTwice.and.calledWith('section_id', undefined)
        .and.calledWith('user_id', undefined);
    });

    it('reloads on change if prop reloadOnChange is set', () => {
      const selectSection = sinon.spy();
      const wrapper = mount(
        <SectionSelector
          alwaysShow={true}
          sections={[fakeSection]}
          unitHasLockableLessons={false}
          unitAllowsHiddenLessons={false}
          selectSection={selectSection}
          reloadOnChange={true}
        />
      );
      wrapper
        .find('select')
        .simulate('change', {target: {value: testSectionId}});
      expect(utils.reload).to.have.been.calledOnce;
      expect(selectSection).not.to.have.been.called;
    });

    it('calls selectSection on change if prop reloadOnChange is not set', () => {
      const selectSection = sinon.spy();
      const wrapper = mount(
        <SectionSelector
          alwaysShow={true}
          sections={[fakeSection]}
          unitHasLockableLessons={false}
          unitAllowsHiddenLessons={false}
          selectSection={selectSection}
          reloadOnChange={false}
        />
      );
      wrapper
        .find('select')
        .simulate('change', {target: {value: testSectionId}});
      expect(selectSection).to.have.been.calledOnce.and.calledWith(
        testSectionId
      );
      expect(utils.reload).not.to.have.been.called;
    });
  });

  describe('inside the teacher dashboard router', () => {
    const UNIT_OVERVIEW_PATH = '/sections/:sectionId/unit/:unitName?';

    // Renders the selector at a dashboard route and reports the resulting path.
    const mountAtRoute = (path, props) => {
      let pathname;
      const ShowLocation = () => {
        pathname = useLocation().pathname;
        return null;
      };
      const wrapper = mount(
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route
              path={UNIT_OVERVIEW_PATH}
              element={
                <div>
                  <SectionSelector
                    sections={[fakeSection, otherSection]}
                    selectSection={() => {}}
                    {...props}
                  />
                  <ShowLocation />
                </div>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      return {wrapper, currentPath: () => pathname};
    };

    beforeEach(() => {
      sinon.stub(utils, 'reload');
      sinon.stub(codeStudioUtils, 'updateQueryParam');
    });

    afterEach(() => {
      codeStudioUtils.updateQueryParam.restore();
      utils.reload.restore();
    });

    it('navigates to the same route with the new section id', () => {
      const selectSection = sinon.spy();
      const {wrapper, currentPath} = mountAtRoute(
        '/sections/123/unit/my-unit',
        {selectSection, selectedSectionId: fakeSection.id}
      );

      wrapper
        .find('select')
        .simulate('change', {target: {value: String(otherSection.id)}});

      expect(currentPath()).to.equal('/sections/456/unit/my-unit');
      expect(selectSection).not.to.have.been.called;
      expect(codeStudioUtils.updateQueryParam).not.to.have.been.called;
    });

    it('leaves the route alone when the section is unselected', () => {
      const {wrapper, currentPath} = mountAtRoute(
        '/sections/123/unit/my-unit',
        {selectedSectionId: fakeSection.id}
      );

      wrapper
        .find('select')
        .simulate('change', {target: {value: NO_SELECTED_SECTION_VALUE}});

      expect(currentPath()).to.equal('/sections/123/unit/my-unit');
    });
  });
});
