/* global dashboard */
import React from 'react';
import { stageShape } from './types';
import StageProgress from './stage_progress.jsx';
import color from '../../color';

const STYLES = {
  row: {
    borderBottom: `2px solid ${color.lighter_gray}`,
    display: 'table',
    tableLayout: 'fixed',
    padding: 10,
    width: '100%'
  },
  stageName: {
    display: 'table-cell',
    width: 200,
    verticalAlign: 'middle',
    paddingRight: 10
  }
};

/**
 * Stage progress component used in level header and course overview.
 */
const CourseProgressRow = React.createClass({
  propTypes: {
    currentLevelId: React.PropTypes.string,
    stage: stageShape
  },

  render() {
    const stage = this.props.stage;

    return (
      <div style={STYLES.row}>
        <div style={STYLES.stageName}>
          {stage.title}
          <div className='stage-lesson-plan-link' style={{display: 'none'}}>
            <a target='_blank' href={stage.lesson_plan_html_url}>
              {dashboard.i18n.t('view_lesson_plan')}
            </a>
          </div>
        </div>
        <StageProgress levels={stage.levels} currentLevelId={this.props.currentLevelId} largeDots={true} saveAnswersFirst={false} />
      </div>
    );
  }
});
module.exports = CourseProgressRow;
