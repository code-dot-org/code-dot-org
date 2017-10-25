import React, {PropTypes} from 'react';
import _ from 'lodash';
import {Panel} from 'react-bootstrap';

export default class DetailViewResponse extends React.Component {
  static propTypes = {
    question: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    answer: PropTypes.any,
    layout: PropTypes.oneOf(['lineItem', 'panel'])
  }

  render() {
    if (this.props.answer && !(typeof this.props.answer === 'boolean')) {
      let renderedValue = this.props.answer;
      if (Array.isArray(renderedValue)) {
        renderedValue = _.join(renderedValue, ', ');
      }

      if (this.props.layout === 'lineItem') {
        return (
          <div>
            <span style={{fontFamily: '"Gotham 7r"', marginRight: '10px'}}>
              {`${this.props.question}${'?:.'.indexOf(this.props.question[this.props.question.length - 1]) >= 0 ? '' : ':'}`}
            </span>
            {renderedValue}
          </div>
        );
      } else {
        return (
          <Panel header={this.props.question} style={{display: 'table'}}>
            {renderedValue}
          </Panel>
        );
      }
    } else {
      return (null);
    }
  }
}
