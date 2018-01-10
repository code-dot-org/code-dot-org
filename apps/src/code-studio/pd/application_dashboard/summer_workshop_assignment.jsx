import React, {PropTypes} from 'react';
import Select from 'react-select';
import { FormGroup, ControlLabel } from 'react-bootstrap';
import { SelectStyleProps } from '../constants';
import DetailViewResponse from './detail_view_response';

export default class SummerWorkshopAssignment extends React.Component {
  static propTypes = {
    workshops: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.isRequired,
      value: PropTypes.number.isRequired
    })).isRequired,
    assignedWorkshop: PropTypes.shape({
      label: PropTypes.isRequired,
      value: PropTypes.number.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    regionalPartnerGroup: PropTypes.number,
    canYouAttendQuestion: PropTypes.string.isRequired,
    canYouAttendAnswer: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired
  }

  render() {
    return (
      <div>
        <FormGroup>
          <ControlLabel>
            Assigned Workshop
          </ControlLabel>
          <Select
            value={this.props.assignedWorkshop.value}
            onChange={this.props.onChange}
            options={this.props.workshops}
            disabled={!this.props.editing}
            {...SelectStyleProps}
          />
        </FormGroup>
        <DetailViewResponse
          question={this.props.canYouAttendQuestion}
          answer={this.props.canYouAttendAnswer}
          layout="lineItem"
        />
      </div>
    );
  }
}
