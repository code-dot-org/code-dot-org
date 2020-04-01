import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import ReactTooltip from 'react-tooltip';

const styles = {
  button: {
    marginLeft: 'auto'
  }
};

export default class DownloadParentLetters extends Component {
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
          class="react-tooltip-hover-stay"
          role="tooltip"
          effect="solid"
          place="top"
          offset={{bottom: 5}}
          delayHide={1000}
        >
          <div>
            “Download parent letters for all [N] students in this section”
          </div>
        </ReactTooltip>
      </div>
    );
  }
}
