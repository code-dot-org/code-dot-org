import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import TeacherCodeComment from '@cdo/apps/code-studio/components/progress/TeacherCodeComment';
import * as teacherCodeCommentRedux from '@cdo/apps/code-studio/components/progress/teacherCodeCommentRedux';

export function initializeTeacherCodeComments() {
  addLineNumberDisplayListener();
  mountComponent();
  addLineNumberClickHandlers();
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

function addLineNumberClickHandlers() {
  const store = getStore();
  getLineNumbers().click(function() {
    const rect = this.getBoundingClientRect();
    const lineNumber = parseInt(this.innerText);
    const state = store.getState().teacherCodeComment;

    if (state.isOpen && state.lineNumber === lineNumber) {
      // if the modal is already open on the current line, go ahead and close it
      store.dispatch(teacherCodeCommentRedux.hideCommentModal());
    } else {
      // otherwise, open it up on the current line
      store.dispatch(
        teacherCodeCommentRedux.showCommentModal(lineNumber, {
          left: rect.right,
          top: rect.bottom
        })
      );
    }
  });
}

function addLineNumberDisplayListener() {
  const store = getStore();

  function handleChange() {
    const comments = store.getState().teacherCodeComment.comments || {};

    getLineNumbers().each((i, e) => {
      $(e).toggleClass('hasComment', e.innerText in comments);
    });
  }
  store.subscribe(handleChange);
  handleChange();
}
