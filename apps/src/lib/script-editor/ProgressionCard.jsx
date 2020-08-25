import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {borderRadius} from './constants';
import OrderControls from './OrderControls';
import LevelToken2 from './LevelToken2';

const styles = {
  lessonCard: {
    fontSize: 18,
    background: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderRadius: borderRadius,
    padding: 20,
    margin: 10
  },
  lessonCardHeader: {
    color: '#5b6770',
    marginBottom: 15
  },
  bottomControls: {
    height: 30
  },
  addLevel: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '0 5px 0 0'
  },
  input: {
    width: '100%'
  },
  title: {
    marginRight: 5
  }
};

export default class ProgressionCard extends Component {
  static propTypes = {
    progression: PropTypes.object
  };

  render() {
    const {progression} = this.props;
    return (
      <div style={styles.lessonCard}>
        <div style={styles.lessonCardHeader}>
          <label>
            <span style={styles.title}>Progression:</span>
            <input defaultValue={progression.displayName} />
            <OrderControls
              name={this.props.progression.key}
              move={() => {
                console.log('Move Progression Card');
              }}
              remove={() => {
                console.log('Remove Progression Card');
              }}
            />
          </label>
        </div>
        <textarea defaultValue={progression.text} style={styles.input} />
        {progression.levels.map(level => (
          <LevelToken2
            key={level.position + '_' + level.ids[0]}
            level={level}
          />
        ))}
        <div style={styles.bottomControls}>
          <span>
            <button
              onMouseDown={() => {
                console.log('Add Tip');
              }}
              className="btn"
              style={styles.addLevel}
              type="button"
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Add Tip
            </button>
          </span>
          <span>
            <button
              onMouseDown={() => {
                console.log('Add Level');
              }}
              className="btn"
              style={styles.addLevel}
              type="button"
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Add Level
            </button>
          </span>
        </div>
      </div>
    );
  }
}
