import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import TeacherCodeComment from '@cdo/apps/code-studio/components/teacherCodeComments/TeacherCodeComment';
import * as teacherCodeCommentRedux from '@cdo/apps/code-studio/components/teacherCodeComments/redux';

export function initializeTeacherCodeComments(studioApp) {
  if (!studioApp.editor) {
    // Teacher Code Comments are only supported in Droplet
    return;
  }

  addLineNumberDisplayListener();
  mountComponent();
  addLineNumberClickHandlers(studioApp);
}

function mountComponent() {
  const commentContainer = getOrCreateContainer(
    'teacher-code-comment-container'
  );

  const store = getStore();

  const isTeacher = store.getState().currentUser.userType === 'teacher';

  ReactDOM.render(
    <Provider store={store}>
      <TeacherCodeComment isTeacher={isTeacher} />
    </Provider>,
    commentContainer
  );
}

function getLineNumbers() {
  return $('.droplet-gutter-line');
}

function getOrCreateContainer(id) {
  let container = document.getElementById(id);

  if (!container) {
    container = document.createElement('div');
    container.setAttribute('id', id);
    document.body.appendChild(container);
  }

  return container;
}

function addLineNumberClickHandlers(studioApp) {
  const store = getStore();
  studioApp.editor.on('guttermousedown', e => {
    const state = store.getState().teacherCodeComments;
    if (
      (state.isOpen && state.lineNumber === e.line) ||
      e.event.target.classList.contains('droplet-gutter')
    ) {
      // if the modal is already open on the current line (or if what we've
      // clicked on is actually the gutter, and not a specific line), go ahead
      // and close it
      store.dispatch(teacherCodeCommentRedux.hideCommentModal());
    } else {
      // otherwise, open it up on the current line
      const rect = e.event.target.getBoundingClientRect();
      const position = {
        left: rect.right,
        top: rect.bottom - rect.height / 2
      };
      const lineHasBreakpoint = !!studioApp.editor.breakpoints[e.line];
      store.dispatch(
        teacherCodeCommentRedux.showCommentModal(
          e.line,
          position,
          lineHasBreakpoint
        )
      );
    }
  });
}

function addLineNumberDisplayListener() {
  const store = getStore();

  function handleChange() {
    const comments = store.getState().teacherCodeComments.comments || {};

    getLineNumbers().each((i, e) => {
      $(e).toggleClass('hasComment', e.innerText in comments);
    });
  }
  store.subscribe(handleChange);
  handleChange();
}
