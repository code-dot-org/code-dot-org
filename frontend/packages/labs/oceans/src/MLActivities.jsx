import React from 'react';
import RPS from './activities/rps/RPS';
import ImageRecognition from './activities/imageRecognition/ImageRecognition';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';
import Panel from 'react-bootstrap/lib/Panel';

const Activity = Object.freeze({
  None: 0,
  RPS: 1,
  ImageRecognition: 2,
});

module.exports = class MLActivities extends React.Component {
  state = {
    currentActivity: Activity.ImageRecognition,
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
            <div>
              <Button onClick={() => this.setState({currentActivity: Activity.RPS})}>Pick RPS Activity</Button>
              <Button onClick={() => this.setState({currentActivity: Activity.ImageRecognition})}>Pick Image Recognition Activity</Button>
            </div>
          }
          {
            this.state.currentActivity === Activity.RPS &&
              <Panel>
                <RPS/>
              </Panel>
          }
          {
            this.state.currentActivity === Activity.ImageRecognition &&
              <Panel>
                <ImageRecognition/>
              </Panel>
          }
        </Col>
        <Col xs={2}>
        </Col>
      </Row>
    </Grid>;
  }
};
