import PropTypes from 'prop-types';
import React, {Component} from 'react';
//import onClickOutside from 'react-onclickoutside';

import DropdownButton from '@cdo/apps/templates/DropdownButton';
import Button from '@cdo/apps/templates/Button';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import i18n from '@cdo/locale';

class PrintPdfDropdownButton extends Component {
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

  render() {
    return (
      <div style={{marginRight: 5}}>
        <DropdownButton color={this.props.color} text={i18n.printingOptions()}>
          {this.props.dropdownOptions.map(option => (
            <a
              href={option.url}
              key={option.key}
              onClick={e =>
                recordAndNavigateToPdf(
                  e,
                  option.key,
                  option.url,
                  this.props.studyGroup,
                  this.props.name
                )
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

const recordAndNavigateToPdf = (e, firehoseKey, url, studyGroup, name) => {
  // Prevent navigation to url until callback
  e.preventDefault();
  firehoseClient.putRecord(
    {
      study: 'pdf-click',
      study_group: studyGroup,
      event: 'open-pdf',
      data_json: JSON.stringify({
        name: name,
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
};

//export default onClickOutside(PrintPdfDropdownButton);
export default PrintPdfDropdownButton;
