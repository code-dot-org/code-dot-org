import React, {PropTypes} from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import _ from 'lodash';

const styles = {
  table: {
    width: 'auto',
    maxWidth: '50%'
  },
  facilitatorResponseList: {
    listStyle: 'circle'
  }
};

export default class Results extends React.Component {
  static propTypes = {
    questions: PropTypes.object,
    thisWorkshop: PropTypes.object,
    sessions: PropTypes.arrayOf(PropTypes.string),
    facilitators: PropTypes.object
  };

  state = {
    facilitatorIds: Object.keys(this.props.facilitators)
  };

  renderSessionResultsTable(session) {
    return (
      <table className="table table-bordered" style={styles.table}>
        <thead>
          <tr>
            <th/>
            <th>This workshop</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(this.props.questions[session]['general']).map(([question_key, question_data], i) => {
              if (['selectValue', 'none'].includes(question_data['answer_type'])) {
                return (
                  <tr key={i}>
                    <td
                      dangerouslySetInnerHTML={{__html: question_data['text']}}// eslint-disable-line react/no-danger
                    />
                    <td>
                      {this.computeAverageFromAnswerObject(this.props.thisWorkshop[session]['general'][question_key])}
                    </td>
                  </tr>
                );
              }
            })
          }
        </tbody>
      </table>
    );
  }

  renderSessionResultsFreeResponse(session) {
    return (
      <div>
        {
          Object.entries(this.props.questions[session]['general']).map(([question_key, question_data], i) => {
            if (question_data['answer_type'] === 'text') {
              return (
                <div key={i} className="well">
                  {question_data['text']}
                  {
                    this.props.thisWorkshop[session]['general'][question_key].map((answer, j) => (
                      <li key={j}>
                        {answer}
                      </li>
                    ))
                  }
                </div>
              );
            }
          })
        }
      </div>
    );
  }

  renderFacilitatorSpecificResultsTable(session) {

    return (
      <table className="table table-bordered" style={styles.table}>
        <thead>
          <tr>
            <th/>
            {this.state.facilitatorIds.map((id, i) => (
              <th key={i}>
                {this.props.facilitators[id]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(this.props.questions[session]['facilitator']).map(([question_key, question_data], i) => {
              if (!question_data['free_response']) {
                return (
                  <tr key={i}>
                    <td>
                      {question_data['text']}
                    </td>
                    {
                      this.state.facilitatorIds.map((id, j) => (
                        <td key={j}>
                          {this.props.thisWorkshop[session]['facilitator'][question_key][id]}
                        </td>
                      ))
                    }
                  </tr>
                );
              }
            })
          }
        </tbody>
      </table>
    );
  }

  renderFacilitatorSpecificFreeResponses(session) {
    return (
      <div>
        {
          Object.entries(this.props.questions[session]['facilitator']).map(([question_key, question_data], i) => {
            if (question_data['free_response']) {
              return (
                <div key={i} className="well">
                  {question_data['text']}
                  {
                    this.state.facilitatorIds.map((id, j) => (
                      <li key={j}>
                        {this.props.facilitators[id]}
                        <ul>
                          {
                            this.props.thisWorkshop[session]['facilitator'][question_key][id].map((response, k) => (
                              <li key={k} style={styles.facilitatorResponseList}>
                                {response}
                              </li>
                            ))
                          }
                        </ul>
                      </li>
                    ))
                  }
                </div>
              );
            }
          })
        }
      </div>
    );
  }

  renderFacilitatorSpecificSection(session) {
    return (
      <div>
        <hr/>
        <h3>
          Facilitator specific questions
        </h3>
        {this.renderFacilitatorSpecificResultsTable(session)}
        {this.renderFacilitatorSpecificFreeResponses(session)}
      </div>
    );
  }

  renderAllSessionsResults() {
    return this.props.sessions.map((session, i) => (
      <Tab eventKey={i + 1} key={i} title={session}>
        <br/>
        {this.renderSessionResultsTable(session)}
        {this.renderSessionResultsFreeResponse(session)}
        {
          this.props.thisWorkshop[session]['facilitator'] && this.renderFacilitatorSpecificSection(session)
        }
      </Tab>
    ));
  }

  computeAverageFromAnswerObject(answerHash) {
    let sum = 0;
    Object.keys(answerHash).map((key) => {
      if (Number(key) > 0) {
        sum += key * answerHash[key];
      }
    });

    if (sum === 0) {
      return '-';
    } else {
      let average = sum / Object.values(answerHash).reduce((sum, x) => {
        return sum + x;
      });

      return _.round(average, 2);
    }
  }

  render() {
    return (
      <Tabs id="SurveyTab">
        {this.renderAllSessionsResults()}
      </Tabs>
    );
  }
}
