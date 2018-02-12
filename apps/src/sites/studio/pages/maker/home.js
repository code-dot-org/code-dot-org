import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import MakerLanding from '@cdo/apps/templates/MakerLanding';

// TODO Erin B. pass real data based on which lesson the student is working on
const topCourse = {
  assignableName: "CSD Unit 6 - Physical Computing",
  lessonName: "Lesson 1: Computing innovations",
  linkToOverview: "http://localhost-studio.code.org:3000/s/csd6",
  linkToLesson: "http://localhost-studio.code.org:3000/s/csd6/stage/1/puzzle/1"
};

$(function () {
  const store = getStore();
  ReactDOM.render(
    <Provider store={store}>
      <MakerLanding
        topCourse={topCourse}
      />
    </Provider>,
    document.getElementById('maker-home')
  );
});
