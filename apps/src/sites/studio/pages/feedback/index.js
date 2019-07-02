import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

$(document).ready(showFeedback);

function showFeedback() {
  const script = document.querySelector('script[data-feedback]');
  const feedbackData = JSON.parse(script.dataset.feedback);

  ReactDOM.render(
    <div>
      <h3>
        This is where there will be an AllFeedback component. For now, I will
        show you that real data is here.
      </h3>
      {feedbackData.all_feedback.map((feedback, i) => {
        return <p key={i}>{feedback.comment}</p>;
      })}
    </div>,
    document.getElementById('feedback-container')
  );
}
