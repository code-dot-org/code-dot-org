import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import {SelectStyleProps} from '../constants';

export default class WorkshopAssignmentSelect extends React.Component {
  static propTypes = {
    workshops: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.isRequired,
        value: PropTypes.number.isRequired
      })
    ).isRequired,
    assignedWorkshopId: PropTypes.number,
    onChange: PropTypes.func.isRequired
  };

  render() {
    return (
      <div style={styles.select}>
        <Select
          value={this.props.assignedWorkshopId}
          onChange={this.props.onChange}
          options={this.props.workshops}
          {...SelectStyleProps}
        />
      </div>
    );
  }
}

const styles = {
  select: {
    width: 400,
    display: 'inline-block'
  }
};
