// Pop-up modal for downloading all Foorm submissions for a single form as a csv.
import React from 'react';
import PropTypes from 'prop-types';
import {Modal, Button} from 'react-bootstrap';
import 'react-select/dist/react-select.css';
import Select from 'react-select/lib/Select';
import {SelectStyleProps} from '../../../constants.js';

const CSV_QUERY_URL = '/api/v1/pd/foorm/submissions_csv';
const FORM_NAME_QUERY_URL = '/api/v1/pd/foorm/form_names';

const styles = {
  modalHeader: {
    padding: 15,
    height: 30,
    borderBottom: 'none'
  },
  modalBody: {
    padding: 20,
    fontSize: 14,
    lineHeight: '14px',
    clear: 'both'
  },
  downloadButton: {
    margin: '25px 0px 25px 0px',
    float: 'right'
  },
  select: {
    marginTop: 5
  }
};

export default class SubmissionsDownloadFom extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      formNamesAndVersions: null,
      loadingFormNames: false,
      selectedForm: {name: '', version: ''},
      selectedFormValue: null,
      showing: false
    };
  }

  componentDidMount() {
    this.getFormNamesAndVersions();
  }

  getFormNamesAndVersions() {
    this.setState({loadingFormNames: true});
    this.loadRequest = $.ajax({
      method: 'GET',
      url: FORM_NAME_QUERY_URL,
      dataType: 'json'
    }).done(data => {
      this.setState({
        loadingFormNames: false,
        formNamesAndVersions: data
      });
    });
  }

  getFormattedFormNameSelectOptions() {
    return this.state.formNamesAndVersions.map((formNameAndVersion, i) => {
      const formName = formNameAndVersion['name'];
      const formVersion = formNameAndVersion['version'];
      return {
        value: `${formName} - ${formVersion}`,
        label: `${formName}, version ${formVersion}`
      };
    });
  }

  open = () => {
    this.setState({showing: true});
  };

  close = () => {
    this.setState({showing: false});
  };

  getQueryParams() {
    return `?name=${this.state.selectedForm.name}&version=${
      this.state.selectedForm.version
    }`;
  }

  onSelectChange = change => {
    const selectedFormNameVersion = change.value.split(' - ', 2);
    this.setState({
      selectedForm: {
        name: selectedFormNameVersion[0],
        version: selectedFormNameVersion[1]
      },
      selectedFormValue: change.value
    });
  };

  handleDownloadCsvClick = () => {
    window.open(`${CSV_QUERY_URL}${this.getQueryParams()}`);
  };

  render() {
    return (
      <div>
        <span onClick={this.open}>{this.props.children}</span>
        <Modal show={this.state.showing} onHide={this.close}>
          <Modal.Header closeButton style={styles.modalHeader}>
            <Modal.Title>Download Survey Results</Modal.Title>
          </Modal.Header>
          <Modal.Body style={styles.modalBody}>
            <div>
              {this.state.formNamesAndVersions && (
                <div>
                  Form
                  <Select
                    options={this.getFormattedFormNameSelectOptions()}
                    value={this.state.selectedFormValue}
                    onChange={this.onSelectChange}
                    style={styles.select}
                    {...SelectStyleProps}
                  />
                  <div>
                    <Button
                      onClick={this.handleDownloadCsvClick}
                      style={styles.downloadButton}
                      disabled={this.state.selectedFormValue === null}
                    >
                      Download as CSV
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
