import React, {Component, PropTypes} from 'react';

class SummaryText extends Component {
  static propTypes = {
    numSubmissions: PropTypes.string,
  };

  render() {
    const {numSubmissions} = this.props;
    return (
      <div>
        <div>
          {`multiple choice questions overview ${numSubmissions}`}
        </div>
      </div>
    );
  }
}

export default SummaryText;
