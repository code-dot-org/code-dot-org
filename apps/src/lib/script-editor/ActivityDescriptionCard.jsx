import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {borderRadius} from './constants';
import OrderControls from './OrderControls';
import TipWithTooltip from './TipWithTooltip';

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
  labelAndCheckbox: {
    fontSize: 13,
    marginTop: 3,
    marginRight: 10
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
  },
  checkboxes: {
    display: 'flex',
    flexDirection: 'row'
  },
  title: {
    marginRight: 5
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
          <label>
            <span style={styles.title}>Title:</span>
            <input defaultValue={this.props.activitySection.title} />
            <OrderControls
              name={this.props.activitySection.title}
              move={() => {
                console.log('Move Activity Description Card');
              }}
              remove={() => {
                console.log('Remove Activity Description Card');
              }}
            />
          </label>
          <div style={styles.checkboxes}>
            <label style={styles.labelAndCheckbox}>
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
            <label style={styles.labelAndCheckbox}>
              Slides
              <input
                checked={this.props.activitySection.slide}
                onChange={() => {
                  console.log('Click checkbox');
                }}
                type="checkbox"
                style={styles.checkbox}
              />
            </label>
          </div>
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
            <span>
              {this.props.activitySection.tips.map(tip => {
                return <TipWithTooltip tip={tip} key={tip.markdown} />;
              })}
            </span>
          )}
        </div>
      </div>
    );
  }
}
