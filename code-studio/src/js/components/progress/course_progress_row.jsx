/* global dashboard */
import React from 'react';
import { STAGE_TYPE } from './types';
import StageProgress from './stage_progress.jsx';
import color from '../../color';

var style = {
  row: {
    borderBottom: `2px solid ${color.lighter_gray}`,
    display: 'table',
    tableLayout: 'fixed',
    padding: '10px',
    width: '100%'
  },
  stageName: {
    display: 'table-cell',
    width: '200px',
    verticalAlign: 'middle',
    paddingRight: '10px'
  }
};

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
      <div style={style.row}>
        <div style={style.stageName}>
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
