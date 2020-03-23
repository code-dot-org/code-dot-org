import PropTypes from 'prop-types';
import React from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import SectionResults from './section_results';

export default class Results extends React.Component {
  static propTypes = {
    questions: PropTypes.object.isRequired,
    thisWorkshop: PropTypes.object.isRequired,
    workshopTabs: PropTypes.arrayOf(PropTypes.string).isRequired,
    courseName: PropTypes.string
    // TODO: add rollups once they are sent by the backend
    // workshopRollups: PropTypes.object,
    // facilitatorRollups: PropTypes.object
  };

  render() {
    return (
      <Tabs id="SurveyTab">
        {this.props.workshopTabs.map((workshopTab, i) => (
          <Tab
            eventKey={i + 1}
            key={i}
            title={`${workshopTab} (${this.props.thisWorkshop[workshopTab][
              'response_count'
            ] || 0})`}
          >
            <br />
            <SectionResults
              section="general"
              questions={this.props.questions}
              answers={this.props.thisWorkshop[workshopTab]}
            />
            {/* TODO: add facilitator feedback per session once we have that data */}
          </Tab>
        ))}
        {/*TODO: Render rollups once they are sent*/}
      </Tabs>
    );
  }
}
