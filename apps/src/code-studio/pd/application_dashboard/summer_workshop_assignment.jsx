import React, {PropTypes} from 'react';
import Select from 'react-select';
import { Grid, Row, Col, ControlLabel } from 'react-bootstrap';
import { SelectStyleProps } from '../constants';
import DetailViewResponse from './detail_view_response';

const styles = {
  select: {
    maxWidth: '400px'
  }
};

export default class SummerWorkshopAssignment extends React.Component {
  static propTypes = {
    workshops: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.isRequired,
      value: PropTypes.number.isRequired
    })).isRequired,
    assignedWorkshopId: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    regionalPartnerGroup: PropTypes.number,
    canYouAttendQuestion: PropTypes.string,
    canYouAttendAnswer: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
  }

  state = {
    loading: true
  }

  render() {
    return (
      <Grid fluid>
        <Row>
          <Col md={2} sm={3}>
            <ControlLabel>
              Assigned Workshop
            </ControlLabel>
          </Col>
          <Col md={3} sm={4}>
            <Select
              value={this.props.assignedWorkshopId}
              onChange={this.props.onChange}
              options={this.props.workshops}
              disabled={!this.props.editing}
              style={styles.select}
              {...SelectStyleProps}
            />
          </Col>
        </Row>
        <DetailViewResponse
          question={this.props.canYouAttendQuestion}
          answer={this.props.canYouAttendAnswer}
          layout="lineItem"
        />
        <br/>
      </Grid>
    );
  }
}
