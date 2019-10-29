import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {Row, Col, FormControl, Panel} from 'react-bootstrap';
import MarkdownSpan from '../components/markdownSpan';

const styles = {
  lineItem: {
    fontFamily: '"Gotham 7r"',
    marginRight: '10px',
    display: 'inline-block'
  },
  panel: {
    width: '66%',
    minWidth: 500,
    marginTop: '10px',
    marginBottom: '10px'
  }
};

const Question = props => {
  const suffix =
    '?:.'.indexOf(props.text[props.text.length - 1]) >= 0 ? '' : ':';
  return (
    <MarkdownSpan style={props.style}>{`${props.text}${suffix}`}</MarkdownSpan>
  );
};
Question.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object
};

export default class DetailViewResponse extends React.Component {
  static propTypes = {
    question: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
      .isRequired,
    questionId: PropTypes.string,
    answer: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
      PropTypes.bool,
      PropTypes.element
    ]),
    layout: PropTypes.oneOf(['lineItem', 'panel']).isRequired,
    score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    possibleScores: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    ),
    editing: PropTypes.bool,
    handleScoreChange: PropTypes.func
  };

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
  };

  render() {
    if (this.props.answer && !(typeof this.props.answer === 'boolean')) {
      let renderedValue = this.props.answer;
      if (Array.isArray(renderedValue)) {
        renderedValue = _.join(renderedValue, ', ');
      }

      const scoredQuestion = !!this.props.possibleScores;

      if (this.props.layout === 'lineItem') {
        return (
          <div>
            <Question text={this.props.question} style={styles.lineItem} />
            {renderedValue}
          </div>
        );
      } else {
        const heading = (
          <Row>
            <Col xs={scoredQuestion ? 9 : 12}>
              <Question text={this.props.question} />
            </Col>
            {scoredQuestion && (
              <Col xs={3}>
                {_.isEqual(this.props.possibleScores, ['Yes', 'No'])
                  ? 'Meets requirements'
                  : 'Score'}
              </Col>
            )}
          </Row>
        );

        return (
          <Panel style={styles.panel}>
            <Panel.Heading>
              <Panel.Title>{heading}</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <Row>
                <Col xs={scoredQuestion ? 9 : 12}>{renderedValue}</Col>
                {scoredQuestion && <Col xs={3}>{this.renderScore()}</Col>}
              </Row>
            </Panel.Body>
          </Panel>
        );
      }
    } else {
      return null;
    }
  }
}
