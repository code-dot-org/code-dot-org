import PropTypes from 'prop-types';
import React from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import SectionResults from './section_results';
import SurveyRollupTableFoorm from '../../components/survey_results/survey_rollup_table_foorm';

const GENERAL = 'general';
const FACILITATOR = 'facilitator';

export default class Results extends React.Component {
  static propTypes = {
    questions: PropTypes.object.isRequired,
    thisWorkshop: PropTypes.object.isRequired,
    workshopTabs: PropTypes.arrayOf(PropTypes.string).isRequired,
    courseName: PropTypes.string,
    // TODO: add rollups once they are sent by the backend
    workshopRollups: PropTypes.object
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
              GENERAL
            ]['response_count'] || 0})`}
          >
            <br />
            <h3>General Questions</h3>
            <SectionResults
              section={GENERAL}
              questions={this.props.questions[GENERAL]}
              answers={this.props.thisWorkshop[workshopTab][GENERAL]}
            />
            {this.props.thisWorkshop[workshopTab][FACILITATOR] && (
              <div>
                <h3>Facilitator Specific Questions</h3>
                <SectionResults
                  section={FACILITATOR}
                  questions={this.props.questions[FACILITATOR]}
                  answers={this.props.thisWorkshop[workshopTab][FACILITATOR]}
                />
              </div>
            )}
          </Tab>
        ))}
        {this.props.workshopRollups && (
          <Tab
            eventKey={this.props.workshopTabs.length + 1}
            key={this.props.workshopTabs.length}
            title="Workshop Rollups"
          >
            <SurveyRollupTableFoorm
              workshopRollups={this.props.workshopRollups['general']}
              questions={this.props.questions}
              courseName={this.props.courseName}
            />
          </Tab>
        )}
      </Tabs>
    );
  }
}
