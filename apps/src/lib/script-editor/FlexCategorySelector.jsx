import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

const styles = {
  flexCategoryLabel: {
    fontSize: 14,
    verticalAlign: 'baseline',
    marginRight: 5
  },
  flexCategorySelect: {
    verticalAlign: 'baseline',
    width: 550,
    margin: '0 5px 0 0'
  },
  flexCategoryButton: {
    verticalAlign: 'baseline',
    margin: '0 5px 0 0'
  }
};

class FlexCategorySelector extends Component {
  static propTypes = {
    labelText: PropTypes.string.isRequired,
    confirmButtonText: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,

    // from redux
    flexCategoryMap: PropTypes.object.isRequired
  };

  state = {
    newFlexCategory: ''
  };

  handleCancel = () => {
    this.setState({newFlexCategory: ''});
    this.props.onCancel();
  };

  flexCategorySelected = newFlexCategory => {
    this.setState({newFlexCategory});
  };

  handleConfirm = () => {
    const {newFlexCategory} = this.state;
    this.setState({newFlexCategory: ''});
    this.props.onConfirm(newFlexCategory);
  };

  render() {
    const {flexCategoryMap} = this.props;
    return (
      <div>
        <span style={styles.flexCategoryLabel}>{this.props.labelText}:</span>
        &nbsp;
        <select
          style={styles.flexCategorySelect}
          onChange={e => this.flexCategorySelected(e.target.value)}
          value={this.state.newFlexCategory}
        >
          <option value="">(none): "Content"</option>
          {Object.keys(flexCategoryMap).map(flexCategory => (
            <option key={flexCategory} value={flexCategory}>
              {flexCategory}: "{flexCategoryMap[flexCategory]}"
            </option>
          ))}
        </select>
        <button
          onMouseDown={this.handleConfirm}
          className="btn btn-primary"
          style={styles.flexCategoryButton}
          type="button"
        >
          {this.props.confirmButtonText}
        </button>
        <button
          onMouseDown={this.handleCancel}
          className="btn"
          style={styles.flexCategoryButton}
          type="button"
        >
          Cancel
        </button>
      </div>
    );
  }
}

export default connect(state => ({
  flexCategoryMap: state.flexCategoryMap
}))(FlexCategorySelector);
