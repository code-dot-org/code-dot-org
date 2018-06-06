import React, {PropTypes} from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import he from 'he';

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
                      {
                        this.computeAverageFromAnswerObject(
                          this.props.thisWorkshop[session]['general'][question_key],
                          question_data['max_value']
                        )
                      }
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
                        {he.decode(answer)}
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
    const hasTableResponses = Object.values(this.props.questions[session]['facilitator']).some((question) => {
      return question['answer_type'] === 'selectValue';
    });

    if (hasTableResponses) {
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
              if (question_data['answer_type'] === 'selectValue') {
                return (
                  <tr key={i}>
                    <td>
                      {question_data['text']}
                    </td>
                    {
                      this.state.facilitatorIds.map((id, j) => (
                        <td key={j}>
                          {he.decode(this.props.thisWorkshop[session]['facilitator'][question_key][id])}
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
    } else {
      return null;
    }
  }

  renderFacilitatorSpecificFreeResponses(session) {
    return (
      <div>
        {
          Object.entries(this.props.questions[session]['facilitator']).map(([question_key, question_data], i) => {
            if (question_data['answer_type'] === 'text') {
              return (
                <div key={i} className="well">
                  {question_data['text']}
                  {
                    this.state.facilitatorIds.map((id) => {
                      return this.renderFacilitatorSpecificBullets(
                        this.props.thisWorkshop[session]['facilitator'][question_key],
                        id
                      );
                    })
                  }
                </div>
              );
            }
          })
        }
      </div>
    );
  }

  renderFacilitatorSpecificBullets(responses, facilitatorId) {
    const hasResponses = responses && responses[facilitatorId];
    return (
      <li key={facilitatorId}>
        {this.props.facilitators[facilitatorId]}
        <ul>
          {
            hasResponses && responses[facilitatorId].map((response, i) => (
              <li key={i} style={styles.facilitatorResponseList}>
                {response}
              </li>
            ))
          }
        </ul>
      </li>
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
      <Tab eventKey={i + 1} key={i} title={`${session} (${this.props.thisWorkshop[session]['response_count'] || 0})`}>
        <br/>
        {this.renderSessionResultsTable(session)}
        {this.renderSessionResultsFreeResponse(session)}
        {
          this.props.thisWorkshop[session]['facilitator'] && this.renderFacilitatorSpecificSection(session)
        }
      </Tab>
    ));
  }

  computeAverageFromAnswerObject(answerHash, maxValue) {
    let sum = 0;
    Object.keys(answerHash).map((key) => {
      if (Number(key) > 0) {
        sum += key * answerHash[key];
      }
    });

    if (sum === 0) {
      return '';
    } else {
      let average = sum / Object.values(answerHash).reduce((sum, x) => {
        return sum + x;
      });
      return `${average.toFixed(2)} / ${maxValue}`;
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
