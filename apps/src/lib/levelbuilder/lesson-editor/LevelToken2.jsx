import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import {
  borderRadius,
  levelTokenMargin
} from '@cdo/apps/lib/levelbuilder/constants';
import {levelShape} from '@cdo/apps/lib/levelbuilder/shapes';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import LevelTokenDetails2 from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelTokenDetails2';
import PropTypes from 'prop-types';

const styles = {
  levelToken: {
    position: 'relative',
    fontSize: 13,
    background: '#eee',
    borderRadius: borderRadius,
    margin: `${levelTokenMargin}px 0`
  },
  reorder: {
    fontSize: 16,
    display: 'table-cell',
    background: '#ddd',
    border: '1px solid #bbb',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    padding: '7px 15px',
    borderTopLeftRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
    cursor: 'ns-resize'
  },
  levelTokenName: {
    padding: 7,
    display: 'table-cell',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    width: '100%',
    borderTop: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer'
  },
  tag: {
    color: 'white',
    background: color.purple,
    padding: '3px 5px',
    lineHeight: '12px',
    borderRadius: 5,
    marginLeft: 3
  },
  remove: {
    fontSize: 14,
    display: 'table-cell',
    color: 'white',
    background: '#c00',
    border: '1px solid #a00',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    padding: '7px 13px',
    borderTopRightRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    cursor: 'pointer'
  },
  edit: {
    fontSize: 14,
    display: 'table-cell',
    color: 'white',
    background: color.teal,
    border: '1px solid #00adbc',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    padding: '7px 13px',
    cursor: 'pointer'
  },
  levelArea: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleAndBubble: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  levelTitle: {
    marginLeft: 5
  }
};

/**
 * Component for editing puzzle dots with one or more level variants.
 */
export default class LevelToken2 extends Component {
  static propTypes = {
    level: levelShape.isRequired,
    removeLevel: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      expand: false
    };
  }

  toggleExpand = () => {
    this.setState({expand: !this.state.expand});
  };

  handleRemove = () => {
    this.props.removeLevel(this.props.level.position);
  };

  render() {
    return (
      <div style={styles.levelToken}>
        <div
          style={styles.reorder}
          onMouseDown={() => {
            console.log('Drag Level');
          }}
        >
          <i className="fa fa-arrows-v" />
        </div>
        <span style={styles.levelTokenName} onMouseDown={this.toggleExpand}>
          <span style={styles.levelArea}>
            <span style={styles.titleAndBubble}>
              <ProgressBubble
                hideToolTips={true}
                level={this.props.level}
                disabled={true}
              />
              <span style={styles.levelTitle}>
                {this.props.level.displayName}
              </span>
            </span>
            <span>
              {this.props.level.ids.length > 1 && (
                <span style={styles.tag}>
                  {this.props.level.ids.length} variants
                </span>
              )}
              {this.props.level.challenge && (
                <span style={styles.tag}>challenge</span>
              )}
              {/* progression supercedes named, so only show the named tag
                  when the level is behaving like a named level. */}
              {this.props.level.named && <span style={styles.tag}>named</span>}
              {this.props.level.assessment && (
                <span style={styles.tag}>assessment</span>
              )}
            </span>
          </span>
        </span>
        <div
          style={styles.edit}
          onClick={() => {
            const win = window.open(this.props.level.url, '_blank');
            win.focus();
          }}
        >
          <i className="fa fa-pencil" />
        </div>
        <div style={styles.remove} onMouseDown={this.handleRemove}>
          <i className="fa fa-times" />
        </div>
        {this.state.expand && <LevelTokenDetails2 level={this.props.level} />}
      </div>
    );
  }
}
