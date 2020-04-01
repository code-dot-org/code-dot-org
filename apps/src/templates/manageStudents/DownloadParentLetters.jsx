import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import ReactTooltip from 'react-tooltip';

const styles = {
  button: {
    marginLeft: 'auto'
  }
};

export default class DownloadParentLetters extends Component {
  static propTypes = {
    numStudents: PropTypes.number.isRequired
  };

  render() {
    return (
      <div style={styles.button}>
        <span data-tip="" data-for="download-letter">
          <Button
            __useDeprecatedTag
            onClick={() => {}}
            color={Button.ButtonColor.gray}
            // text={i18n.moveStudents()}
            text="Download parent letters"
          />
        </span>
        <ReactTooltip
          id="download-letter"
          role="tooltip"
          effect="solid"
          delayShow={500}
        >
          <div>
            Download parent letters for all {this.props.numStudents} students in
            this section
          </div>
        </ReactTooltip>
      </div>
    );
  }
}
