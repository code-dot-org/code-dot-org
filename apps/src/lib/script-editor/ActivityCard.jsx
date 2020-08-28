import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '../../util/color';
import {borderRadius} from './constants';
import OrderControls from './OrderControls';
import ActivityDescriptionCard from './ActivityDescriptionCard';
import ProgressionCard from './ProgressionCard';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  groupHeader: {
    fontSize: 18,
    color: 'white',
    background: color.cyan,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    padding: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  button: {
    marginLeft: 10
  },
  label: {
    fontSize: 20,
    marginRight: 5
  },
  input: {
    marginRight: 10
  },
  labelAndInput: {
    marginLeft: 5,
    display: 'flex',
    alignItems: 'center'
  }
};

export default class ActivityCard extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      collapsed: false
    };
  }

  render() {
    const {activity} = this.props;

    return (
      <div>
        <div
          style={{
            ...styles.groupHeader,
            ...(this.state.collapsed && {marginBottom: 10})
          }}
        >
          <FontAwesome
            icon={this.state.collapsed ? 'expand' : 'compress'}
            onClick={() => {
              this.setState({
                collapsed: !this.state.collapsed
              });
            }}
          />
          <label style={styles.labelAndInput}>
            <span style={styles.label}>{`Activity:`}</span>
            <input defaultValue={activity.displayName} style={styles.input} />
          </label>
          <label style={styles.labelAndInput}>
            <span style={styles.label}>{`Time (mins):`}</span>
            <input
              defaultValue={activity.time}
              style={{...styles.input, ...{width: 50}}}
            />
          </label>
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
        <div style={styles.groupBody} hidden={this.state.collapsed}>
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
          <button
            onMouseDown={() => {
              console.log('Preview Activity');
            }}
            className="btn"
            style={styles.addLesson}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-eye" />
            Preview
          </button>
        </div>
      </div>
    );
  }
}
