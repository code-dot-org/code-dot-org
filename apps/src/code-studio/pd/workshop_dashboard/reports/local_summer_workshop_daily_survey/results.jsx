import React, {PropTypes} from 'react';

export default class Results extends React.Component {
  static propTypes = {
    questions: PropTypes.object,
    thisWorkshop: PropTypes.object,
    allMyWorkshops: PropTypes.object,
    sessions: PropTypes.arrayOf(PropTypes.string)
  };

  state = {loading: true};

  renderSessionResultsTable(session) {
    return (
      <table className="table table-bordered" style={{width: 'auto'}}>
        <thead>
          <tr>
            <th/>
            <th>This workshop</th>
            <th>All my local summer workshops</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(this.props.questions[session]).map(([question_key, question_data], i) => {
              if (!question_data['free_response']) {
                return (
                  <tr key={i}>
                    <td>
                      {question_data['text']}
                    </td>
                    <td>
                      {this.props.thisWorkshop[session][question_key]}
                    </td>
                    <td>
                      {this.props.allMyWorkshops[session][question_key]}
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
          Object.entries(this.props.questions[session]).map(([question_key, question_data], i) => {
            if (question_data['free_response']) {
              return (
                <div key={i} className="well">
                  {question_data['text']}
                  {
                    this.props.thisWorkshop[session][question_key].map((answer, j) => (
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

  renderSessionResults(session) {
    return (
      <div>
        Session results for {session}
        {this.renderSessionResultsTable(session)}
        {this.renderSessionResultsFreeResponse(session)}
        <hr/>
      </div>
    );
  }

  renderAllSessionsResults() {
    return this.props.sessions.map((session, i) => (
      <div key={i}>
        {this.renderSessionResults(session)}
      </div>
    ));
  }

  render() {
    return (
      <div>
        {this.renderAllSessionsResults()}
      </div>
    );
  }
}
