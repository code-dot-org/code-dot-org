import React, {PropTypes} from 'react';
import Select from 'react-select';
import { Grid, Row, Col, ControlLabel } from 'react-bootstrap';
import { SelectStyleProps } from '../constants';

const styles = {
  select: {
    maxWidth: '400px'
  },
  grid: {
    marginBottom: '20px',
    paddingLeft: '0px'
  },
  row: {
    width: '63%'
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

  render() {
    return (
      <Grid fluid style={styles.grid}>
        <Row style={styles.row}>
          <Col md={2} sm={3}>
            <ControlLabel>
              Assigned Workshop
            </ControlLabel>
          </Col>
          <Col md={10} sm={9}>
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
      </Grid>
    );
  }
}
