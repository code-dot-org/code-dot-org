import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store, AnyAction} from 'redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import teacherSections, {
  serverSectionFromSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import TeacherNavigationBar from '@cdo/apps/templates/teacherNavigation/TeacherNavigationBar';
import i18n from '@cdo/locale';

describe('TeacherNavigationBar', () => {
  const sections = [
    {
      id: 11,
      name: 'Period 1',
      hidden: false,
    },
    {
      id: 12,
      name: 'Period 2',
      hidden: false,
    },
    {
      id: 13,
      name: 'Period 3',
      hidden: true,
    },
  ];
  const serverSections = sections.map(serverSectionFromSection);

  let store: Store<unknown, AnyAction>;

  beforeEach(() => {
    store = getStore();
    registerReducers({
      teacherSections,
    });
    store.dispatch(setSections(serverSections));
  });

  test('renders correctly with visible sections', () => {
    render(
      <Provider store={store}>
        <TeacherNavigationBar />
      </Provider>
    );

    const classLabel = screen.getByText(i18n.classSections());
    expect(classLabel).toBeDefined();

    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toBeDefined();

    const option1 = screen.getByText('Period 1');
    expect(screen.queryByText('Period 3')).toBeNull();
    const option2 = screen.getByText('Period 2');
    expect(option1).toBeDefined();
    expect(option2).toBeDefined();
  });
});
