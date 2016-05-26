/* global dashboard */
import React from 'react';
import { STAGE_TYPE } from './types';
import StageProgress from './stage_progress.jsx';

/**
 * Stage progress component used in level header and course overview.
 */
var CourseProgressRow = React.createClass({
  propTypes: {
    stage: STAGE_TYPE
  },

  render() {
    var stage = this.props.stage;

    return (
      <div className='game-group'>
        <div className='stage'>
          {stage.title}
          <div className='stage-lesson-plan-link' style={{display: 'none'}}>
            <a target='_blank' href={stage.lesson_plan_html_url}>
              {dashboard.i18n.t('view_lesson_plan')}
            </a>
          </div>
        </div>
        <StageProgress levels={stage.levels} largeDots={true} saveAnswersFirst={false} />
      </div>
    );
  }
});
module.exports = CourseProgressRow;
