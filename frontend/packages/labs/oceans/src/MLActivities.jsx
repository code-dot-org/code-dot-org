import React from 'react';
import RPS from './activities/rps/RPS';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';
import Panel from 'react-bootstrap/lib/Panel';

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
        <Col xs={2}>
        </Col>
        <Col xs={8}>
          <h1>
            ML Activities Playground
          </h1>
          {
            this.state.currentActivity !== Activity.None &&
            <Button
              onClick={() => this.setState({
                currentActivity: Activity.None
              })}
              style={{marginBottom: 10}}
            >
              Pick Another Activity
            </Button>
          }
          {
            this.state.currentActivity === Activity.None &&
            <Button
              onClick={() => this.setState({
                currentActivity: Activity.RPS
              })}
            >
              Pick RPS Activity
            </Button>
          }
          {
            this.state.currentActivity === Activity.RPS &&
              <Panel>
                <RPS/>
              </Panel>
          }
        </Col>
        <Col xs={2}>
        </Col>
      </Row>
    </Grid>;
  }
};
