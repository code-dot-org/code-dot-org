import React, {PropTypes} from 'react';
import _ from 'lodash';
import {Panel} from 'react-bootstrap';
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
    answer: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.bool]),
    layout: PropTypes.oneOf(['lineItem', 'panel']).isRequired
  };

  render() {
    if (this.props.answer && !(typeof this.props.answer === 'boolean')) {
      let renderedValue = this.props.answer;
      if (Array.isArray(renderedValue)) {
        renderedValue = _.join(renderedValue, ', ');
      }

      if (this.props.layout === 'lineItem') {
        return (
          <div>
            <Question text={this.props.question} style={styles.lineItem} />
            {renderedValue}
          </div>
        );
      } else {
        return (
          <div className="row">
            <div className="col-md-8">
              <Panel
                header={
                  <Question text={this.props.question}/>
                }
              >
                {renderedValue}
              </Panel>
            </div>
          </div>
        );
      }
    } else {
      return (null);
    }
  }
}
