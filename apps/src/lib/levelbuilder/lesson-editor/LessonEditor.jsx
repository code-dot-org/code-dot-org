import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ActivitiesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';

const styles = {
  textarea: {
    width: '100%'
  },
  editor: {
    width: '100%'
  }
};

export default class LessonEditor extends Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    overview: PropTypes.string
  };

  render() {
    const {displayName, overview} = this.props;
    return (
      <div style={styles.editor}>
        <h1>Editing Lesson "{displayName}"</h1>

        <label>
          <p>Overview</p>
          <textarea
            name="overview"
            style={styles.textarea}
            rows={5}
            defaultValue={overview}
          />
        </label>

        <h2>Activities & Levels</h2>
        <ActivitiesEditor />

        <button className="btn btn-primary" type="submit" style={{margin: 0}}>
          Save Changes
        </button>
      </div>
    );
  }
}
