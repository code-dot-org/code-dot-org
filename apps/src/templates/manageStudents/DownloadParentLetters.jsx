import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import ReactTooltip from 'react-tooltip';
import i18n from '@cdo/locale';

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
            text={i18n.downloadParentLetter()}
            icon="file-text"
          />
        </span>
        <ReactTooltip
          id="download-letter"
          role="tooltip"
          effect="solid"
          delayShow={500}
        >
          <div>
            {i18n.downloadParentLetterTooltip({
              numStudents: this.props.numStudents
            })}
          </div>
        </ReactTooltip>
      </div>
    );
  }
}
