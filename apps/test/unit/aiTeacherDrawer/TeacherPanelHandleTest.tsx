import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {setChatIsOpen} from '@cdo/apps/aiTeacherDrawer/redux';
import {aiDiffChatReducer} from '@cdo/apps/aiTeacherDrawer/redux/slice';
import TeacherPanelHandle from '@cdo/apps/aiTeacherDrawer/TeacherPanelHandle';
import {getStore, registerReducers} from '@cdo/apps/redux';

const renderHandle = () => {
  const store = getStore();
  registerReducers({aiDiffChat: aiDiffChatReducer});

  render(
    <Provider store={store}>
      <TeacherPanelHandle />
    </Provider>
  );

  return store;
};

// The handle is a plain div, so it is addressed by its icon's title.
const handleRoot = () =>
  screen.getByTitle('Open teacher panel').closest('.teacher-panel');

describe('TeacherPanelHandle', () => {
  it('is offered while the drawer is closed', () => {
    const store = renderHandle();
    store.dispatch(setChatIsOpen(false));

    expect(handleRoot()).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('leaves the accessibility tree once the drawer covers it', () => {
    const store = renderHandle();
    store.dispatch(setChatIsOpen(true));

    expect(handleRoot()).toHaveAttribute('aria-hidden', 'true');
  });
});
