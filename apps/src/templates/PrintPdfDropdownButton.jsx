import PropTypes from 'prop-types';
import React, {Component} from 'react';

import DropdownButton from '@cdo/apps/templates/DropdownButton';
import Button from '@cdo/apps/templates/Button';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import i18n from '@cdo/locale';

/**
 * Simple wrapper to DropdownButton for the PDF-backed "Printing Options"
 * dropdowns we render on the Unit and Lesson overview pages.
 *
 * Note that although this is quite a simple component, it does need to be a
 * Class Component rather than a Functional Component so DropdownButton's
 * onClickOutside handler still works. Once we upgrade to React 16+, this can
 * be simplified.
 *
 * See https://www.npmjs.com/package/react-onclickoutside#functional-component-with-usestate-hook
 */
export default class PrintPdfDropdownButton extends Component {
  static propTypes = {
    color: PropTypes.oneOf(Object.values(Button.ButtonColor)).isRequired,
    dropdownOptions: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
      })
    ).isRequired,
    name: PropTypes.string.isRequired,
    studyGroup: PropTypes.string.isRequired
  };

  /**
   * Record on firehose that a user has clicked on a PDF link, then navigate
   * them to that PDF.
   */
  recordAndNavigateToPdf(e, firehoseKey, url) {
    // Prevent navigation to url until callback
    e.preventDefault();
    firehoseClient.putRecord(
      {
        study: 'pdf-click',
        study_group: this.props.studyGroup,
        event: 'open-pdf',
        data_json: JSON.stringify({
          name: this.props.name,
          pdfType: firehoseKey
        })
      },
      {
        includeUserId: true,
        callback: () => {
          window.location.href = url;
        }
      }
    );
    return false;
  }

  render() {
    return (
      <div style={{marginRight: 5}}>
        <DropdownButton color={this.props.color} text={i18n.printingOptions()}>
          {this.props.dropdownOptions.map(option => (
            <a
              href={option.url}
              key={option.key}
              onClick={e =>
                this.recordAndNavigateToPdf(e, option.key, option.url)
              }
            >
              {option.name}
            </a>
          ))}
        </DropdownButton>
      </div>
    );
  }
}
