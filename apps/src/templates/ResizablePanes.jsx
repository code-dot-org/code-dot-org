/** @file Divide a region into a set of panels and allow resizing them.
 *
 *  Similar to react-split-pane (MIT license) but supports more than two panes
 *  and works with React 0.14.7.
 *  @see https://github.com/tomkp/react-split-pane
 */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Radium from 'radium';

/**
 * Wraps its children to display them in a flexbox layout.
 */
class ResizablePanes extends Component {
  static propTypes = {
    style: PropTypes.object,
    columnSizes: PropTypes.arrayOf(PropTypes.number).isRequired,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.node,
    lockedColumns: PropTypes.arrayOf(PropTypes.number)
  };

  state = {
    dragging: false,
    index: 0
  };

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  onResizerMouseDown = event => {
    this.unFocus();
    this.setState({
      dragging: true,
      index: parseInt(event.target.dataset.resizerIndex, 10)
    });
  };

  onMouseMove = event => {
    if (!this.state.dragging) {
      return;
    }
    this.unFocus();
    const resizingPane = this.refs[`pane-${this.state.index}`];
    if (!resizingPane) {
      return;
    }

    const resizingPaneDOMNode = ReactDOM.findDOMNode(resizingPane);
    if (!resizingPaneDOMNode.getBoundingClientRect) {
      return;
    }

    const boundingRect = resizingPaneDOMNode.getBoundingClientRect();

    let newSizes = this.props.columnSizes.slice();
    newSizes[this.state.index] = event.clientX - boundingRect.left;
    this.props.onChange(newSizes);
  };

  onMouseUp = () => {
    if (this.state.dragging) {
      this.setState({dragging: false});
    }
  };

  unFocus = () => {
    if (document.selection) {
      document.selection.empty();
    } else {
      window.getSelection().removeAllRanges();
    }
  };

  getClonedChild(child, index) {
    const columnSize = this.props.columnSizes[index];
    const style = _.assign(
      {flex: '1'},
      child.props.style,
      typeof columnSize !== 'undefined'
        ? {flex: `0 0 ${columnSize}px`}
        : undefined
    );

    return React.cloneElement(child, {
      ref: `pane-${index}`,
      key: `pane-${index}`,
      style
    });
  }

  getResizer(index) {
    return (
      <div
        key={`resizer-${index}`}
        data-resizer-index={index}
        style={styles.resizer}
        onMouseDown={this.onResizerMouseDown}
      />
    );
  }

  isColumnLocked = index => {
    if (!this.props.lockedColumns) {
      return false;
    }

    return this.props.lockedColumns.indexOf(index) >= 0;
  };

  getChildren() {
    const childCount = React.Children.count(this.props.children);
    const computedChildren = [];
    React.Children.forEach(
      this.props.children,
      (child, index) => {
        if (!child) {
          return;
        }
        computedChildren.push(this.getClonedChild(child, index));
        const isLockedColumn = this.isColumnLocked(index);
        const isFinalColumn = index === childCount - 1;
        if (!isFinalColumn && !isLockedColumn) {
          computedChildren.push(this.getResizer(index));
        }
      },
      this
    );
    return computedChildren;
  }

  render() {
    const styles = {
      root: _.assign(
        {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap'
        },
        this.props.style
      )
    };

    return (
      <div className="resizable-panes" style={styles.root}>
        {this.getChildren()}
      </div>
    );
  }
}

const styles = {
  resizer: {
    flex: '0 0 0',
    boxSizing: 'border-box',
    opacity: 0.2,
    zIndex: 1,
    backgroundColor: '#000',
    backgroundClip: 'padding-box',
    userSelect: 'text',
    width: 31,
    margin: '0 -5px',
    borderLeft: '5px solid',
    borderRight: '5px solid',
    borderColor: 'rgba(255, 255, 255, 0)',
    cursor: 'col-resize',
    height: '100%',
    ':hover': {
      transition: 'all 2s ease',
      borderColor: 'rgba(0, 0, 0, 0.5)'
    }
  }
};

export default Radium(ResizablePanes);
