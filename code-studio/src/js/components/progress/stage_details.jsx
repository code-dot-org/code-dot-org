import React from 'react';
import { stageShape } from './types';

/**
 * Stage progress component used in level header and course overview.
 */
const StageDetails = React.createClass({
  propTypes: {
    stage: stageShape
  },

  render() {
    const items = this.props.stage.levels.map(level => {
      return (
        <div key={level.id}>
          <a href={level.url}>
            <div className={`level-${level.id} level_link ${level.status || 'not_tried'}`}>
              <i className={`fa ${level.icon}`} />
            </div>
            &nbsp;
            {level.name}
          </a>
        </div>
      );
    });

    return (
      <div>
        <div className='teacher-stage'>
          {this.props.stage.name}
        </div>
        {items}
      </div>
    );
  }
});
module.exports = StageDetails;
