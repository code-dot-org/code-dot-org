import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '../../../util/color';
import {relatedLessonShape} from '../shapes';

export default class RelatedLessons extends Component {
  static propTypes = {
    relatedLessons: PropTypes.arrayOf(relatedLessonShape).isRequired
  };

  getRelatedLessonText(lesson) {
    const includeYear =
      lesson.versionYear && !lesson.scriptTitle.includes(lesson.versionYear);
    const year = includeYear ? ` - ${lesson.versionYear}` : '';
    const type = lesson.lockable ? 'Lockable' : 'Lesson';
    return `${lesson.scriptTitle}${year} - ${type} ${lesson.relativePosition}`;
  }

  render() {
    const {relatedLessons} = this.props;
    if (relatedLessons.length === 0) {
      return null;
    }
    return (
      <div style={styles.relatedLessonContainer}>
        <h2 style={styles.relatedLessonHeader}>Update Similar Lessons</h2>
        <p>
          The following lessons are similar to this one. You may want to make
          updates to them as well. Saving this lesson will not update other
          lessons.
        </p>
        {relatedLessons.map(lesson => (
          <a
            key={lesson.id}
            href={lesson.editUrl}
            style={styles.relatedLessonLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {this.getRelatedLessonText(lesson)}
          </a>
        ))}
      </div>
    );
  }
}

const styles = {
  relatedLessonHeader: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10
  },
  relatedLessonContainer: {
    marginBottom: -15
  },
  relatedLessonLink: {
    marginRight: 30,
    marginBottom: 15,
    display: 'inline-block',
    color: color.purple,
    textDecoration: 'underline'
  }
};
