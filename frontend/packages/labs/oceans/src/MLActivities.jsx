import React from 'react';
import RPS from './activities/rps/RPS';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';

const Activity = Object.freeze({
  None: 0,
  RPS: 1,
});

module.exports = class MLActivities extends React.Component {
  state = {
    currentActivity: Activity.RPS,
  };

  render() {
    return <Grid fluid>
      <Row className="show-grid">
        <Col sm={2}>
        </Col>
        <Col sm={8}>
          <h1>
            ML Activities Playground
          </h1>
          {
            this.state.currentActivity !== Activity.None &&
            <Button
              bsSize="large"
              onClick={() => this.setState({
                currentActivity: Activity.None
              })}
            >
              Pick Another Activity
            </Button>
          }
          {
            this.state.currentActivity === Activity.None &&
            <Button
              bsSize="large"
              onClick={() => this.setState({
                currentActivity: Activity.RPS
              })}
            >
              Pick RPS Activity
            </Button>
          }
          {
            this.state.currentActivity === Activity.RPS &&
            <RPS/>
          }
        </Col>
        <Col sm={2}>
        </Col>
      </Row>
    </Grid>;
  }
};
