import React, {PropTypes} from 'react';
import _ from 'lodash';
import {FormControl, Panel} from 'react-bootstrap';
import MarkdownSpan from '../components/markdownSpan';

const styles = {
  lineItem: {
    fontFamily: '"Gotham 7r"',
    marginRight: '10px'
  }
};

const Question = (props) => {
  const suffix = '?:.'.indexOf(props.text[props.text.length - 1]) >= 0 ? '' : ':';
  return (
    <MarkdownSpan style={props.style}>
      {`${props.text}${suffix}`}
    </MarkdownSpan>
  );
};
Question.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object
};

export default class DetailViewResponse extends React.Component {
  static propTypes = {
    question: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    questionId: PropTypes.string,
    answer: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.bool, PropTypes.element]),
    layout: PropTypes.oneOf(['lineItem', 'panel']).isRequired,
    score: PropTypes.string,
    possibleScores: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    editing: PropTypes.bool,
    handleScoreChange: PropTypes.func
  }

  renderScoreOptions() {
    return this.props.possibleScores.map((score, i) => (
      <option value={score} key={i}>
        {score}
      </option>
    ));
  }

  renderScore = () => {
    return (
      <FormControl
        componentClass="select"
        disabled={!this.props.editing}
        value={this.props.score}
        onChange={this.props.handleScoreChange}
        id={`${this.props.questionId}-score`}
      >
        <option>--</option>
        {this.renderScoreOptions()}
      </FormControl>
    );
  }

  render() {
    if (this.props.answer && !(typeof this.props.answer === 'boolean')) {
      let renderedValue = this.props.answer;
      if (Array.isArray(renderedValue)) {
        renderedValue = _.join(renderedValue, ', ');
      }

      const scoredQuestion = !!(this.props.possibleScores);

      if (this.props.layout === 'lineItem') {
        return (
          <div>
            <Question text={this.props.question} style={styles.lineItem} />
            {renderedValue}
          </div>
        );
      } else {
        const heading = (
          <div className="row">
            <div className={scoredQuestion ? 'col-md-9' : 'col-md-12'}>
              <Question text={this.props.question}/>
            </div>
            {
              scoredQuestion && (
                <div className="col-md-3">
                  {
                    _.isEqual(this.props.possibleScores, ['Yes', 'No']) ? 'Meets requirements' : 'Score'
                  }
                </div>
              )
            }
          </div>
        );

        return (
          <Panel header={heading} style={{width: '66%'}}>
            <div className="row">
              <div className={scoredQuestion ? 'col-md-9' : 'col-md-12'}>
                {renderedValue}
              </div>
              {
                scoredQuestion && (
                  <div className="col-md-3">
                    {this.renderScore()}
                  </div>
                )
              }
            </div>
          </Panel>
        );
      }
    } else {
      return (null);
    }
  }
}
