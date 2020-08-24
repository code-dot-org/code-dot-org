import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {borderRadius} from './constants';
import OrderControls from './OrderControls';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {tipTypes} from '@cdo/apps/code-studio/components/LessonTip';

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  },
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
  lessonLockable: {
    fontSize: 13,
    marginTop: 3
  },
  input: {
    width: '100%'
  },
  bottomControls: {
    height: 30,
    display: 'flex',
    justifyContent: 'space-between'
  },
  addLevel: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '0 5px 0 0'
  }
};

export default class ActivityDescriptionCard extends Component {
  static propTypes = {
    activitySection: PropTypes.object
  };

  render() {
    return (
      <div style={styles.lessonCard}>
        <div style={styles.lessonCardHeader}>
          <OrderControls
            name={this.props.activitySection.text}
            move={() => {
              console.log('Move Activity Description Card');
            }}
            remove={() => {
              console.log('Remove Activity Description Card');
            }}
          />
          <label style={styles.lessonLockable}>
            Remarks
            <input
              checked={this.props.activitySection.isRemarks}
              onChange={() => {
                console.log('Click checkbox');
              }}
              type="checkbox"
              style={styles.checkbox}
            />
          </label>
        </div>
        <textarea
          defaultValue={this.props.activitySection.text}
          rows={Math.max(
            this.props.activitySection.text.split(/\r\n|\r|\n/).length + 1,
            2
          )}
          style={styles.input}
        />
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
          {this.props.activitySection.tips.length > 0 && (
            <span style={styles.icons}>
              {this.props.activitySection.tips.map(tip => {
                return (
                  <FontAwesome
                    key={tip.markdown}
                    icon={tipTypes[tip.type].icon}
                    style={{color: tipTypes[tip.type].color, padding: '2px'}}
                    onClick={() => {
                      console.log('Open tip editor');
                    }}
                  />
                );
              })}
            </span>
          )}
        </div>
      </div>
    );
  }
}
