import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '../../util/color';
import {borderRadius} from './constants';
import OrderControls from './OrderControls';
import ActivityDescriptionCard from './ActivityDescriptionCard';
import ProgressionCard from './ProgressionCard';

const styles = {
  groupHeader: {
    fontSize: 18,
    color: 'white',
    background: color.cyan,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    padding: 10
  },
  groupBody: {
    background: color.lightest_cyan,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    padding: 10,
    marginBottom: 20
  },
  addLesson: {
    fontSize: 14,
    color: '#5b6770',
    background: 'white',
    border: '1px solid #ccc',
    boxShadow: 'none',
    margin: '0 10px 10px 10px'
  },
  addLevel: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '0 5px 0 0'
  },
  button: {
    marginLeft: 10
  }
};

export default class ActivityCard extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  render() {
    const {activity} = this.props;

    return (
      <div>
        <div style={styles.groupHeader}>
          {`Activity: ${activity.key}: "${activity.displayName}"`}
          <span style={styles.button}>
            <button
              onMouseDown={() => {
                console.log('Preview Activity');
              }}
              className="btn"
              style={styles.addLevel}
              type="button"
            >
              Preview
            </button>
          </span>
          <OrderControls
            name={activity.key || '(none)'}
            move={() => {
              console.log('Move Activity Card');
            }}
            remove={() => {
              console.log('Remove Activity Card');
            }}
          />
        </div>
        <div style={styles.groupBody}>
          {activity.activitySections.map((block, index) => {
            if (block.type === 'description') {
              return (
                <ActivityDescriptionCard
                  key={`description-${index}`}
                  activitySection={block}
                />
              );
            } else {
              return (
                <ProgressionCard
                  key={`progression-${index}`}
                  progression={block}
                />
              );
            }
          })}
          <button
            onMouseDown={() => {
              console.log('Add Description Card');
            }}
            className="btn"
            style={styles.addLesson}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Add Description
          </button>
          <button
            onMouseDown={() => {
              console.log('Add Progression Card');
            }}
            className="btn"
            style={styles.addLesson}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Add Progression
          </button>
        </div>
      </div>
    );
  }
}
