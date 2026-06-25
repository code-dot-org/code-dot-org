import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import RollupLessonEntrySection from './RollupLessonEntrySection';
import {lessonShape} from './rollupShapes';

import style from './courseRollup.module.scss';

export default class RollupLessonEntry extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    lesson: lessonShape,
  };

  render() {
    return (
      <div className={style.lessonEntry}>
        <div className={style.lessonHeader}>
          <a href={this.props.lesson.link} className={style.lessonLink}>
            <Typography
              variant="inherit"
              component="h3"
              className={style.lessonTitle}
            >
              {this.props.lesson.title}
            </Typography>
          </a>
        </div>
        <div className={style.lessonEntries}>
          <RollupLessonEntrySection
            objectToRollUp={this.props.objectToRollUp}
            lesson={this.props.lesson}
          />
          {this.props.objectToRollUp === 'Resources' && (
            <RollupLessonEntrySection
              objectToRollUp={'Prep'}
              lesson={this.props.lesson}
            />
          )}
        </div>
      </div>
    );
  }
}
