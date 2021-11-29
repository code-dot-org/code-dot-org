// Pop-up modal for downloading all Foorm submissions for a single form as a csv.
import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  FormGroup,
  ControlLabel,
  Col,
  Row
} from 'react-bootstrap';
import 'react-select/dist/react-select.css';
import Select from 'react-select/lib/Select';
import ReactTooltip from 'react-tooltip';
import {SelectStyleProps} from '../../../constants.js';
import DatePicker from '../../components/date_picker.jsx';
import FontAwesome from '../../../../../templates/FontAwesome.jsx';

export default class SubmissionsDownloadForm extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    workshopId: PropTypes.string,
    style: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      formNamesAndVersions: null,
      loadingFormNames: false,
      selectedForm: {name: '', version: ''},
      selectedFormValue: null,
      showing: false,
      startDate: null,
      endDate: null
    };
  }

  componentDidMount() {
    this.getFormNamesAndVersions();
  }

  getFormNamesAndVersions() {
    this.setState({loadingFormNames: true});
    this.loadRequest = $.ajax({
      method: 'GET',
      url: this.getFormNameVersionQueryUrl(),
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
    if (this.props.workshopId) {
      return `?name=${this.state.selectedForm.name}&version=${
        this.state.selectedForm.version
      }`;
    } else {
      let queryParams = `?name=${this.state.selectedForm.name}&version=${
        this.state.selectedForm.version
      }`;
      if (this.state.startDate) {
        queryParams = `${queryParams}&start_date=${this.formatStartDate(
          this.state.startDate
        )}`;
      }
      if (this.state.endDate) {
        queryParams = `${queryParams}&end_date=${this.formatEndDate(
          this.state.endDate
        )}`;
      }
      return queryParams;
    }
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

  formatStartDate(date) {
    return date ? date.toISOString() : null;
  }

  formatEndDate(date) {
    if (date) {
      // set end date to end of day
      date = new Date(date.year(), date.month(), date.date(), 23, 59, 59, 999);
    }
    return date ? date.toISOString() : null;
  }

  handleStartChange = date => {
    this.setState({
      startDate: date
    });
  };

  handleEndChange = date => {
    this.setState({
      endDate: date
    });
  };

  handleDownloadCsvClick = () => {
    window.open(`${this.getCsvQueryUrl()}${this.getQueryParams()}`);
  };

  getCsvQueryUrl() {
    if (this.props.workshopId) {
      return `/api/v1/pd/workshops/${
        this.props.workshopId
      }/foorm/csv_survey_report`;
    } else {
      return '/api/v1/pd/foorm/forms/submissions_csv';
    }
  }

  getFormNameVersionQueryUrl() {
    if (this.props.workshopId) {
      return `/api/v1/pd/workshops/${
        this.props.workshopId
      }/foorm/forms_for_workshop`;
    } else {
      return '/api/v1/pd/foorm/forms/form_names';
    }
  }

  render() {
    let isDownloadButtonDisabled = this.props.workshopId
      ? this.state.selectedFormValue === null
      : this.state.selectedFormValue === null ||
        this.state.startDate === null ||
        this.state.endDate === null;

    return (
      <div style={this.props.style}>
        <span onClick={this.open}>{this.props.children}</span>
        <Modal show={this.state.showing} onHide={this.close}>
          <Modal.Header closeButton style={styles.modalHeader}>
            <Modal.Title>Download Survey Results</Modal.Title>
          </Modal.Header>
          <Modal.Body style={styles.modalBody}>
            <div>
              {this.state.formNamesAndVersions && (
                <div>
                  <Row style={styles.selectRow}>
                    <FormGroup>
                      <ControlLabel>Form</ControlLabel>
                      <Select
                        options={this.getFormattedFormNameSelectOptions()}
                        value={this.state.selectedFormValue}
                        onChange={this.onSelectChange}
                        {...SelectStyleProps}
                      />
                    </FormGroup>
                  </Row>
                  {!this.props.workshopId && (
                    <div>
                      <Row className="submission-download-datepicker">
                        <Col md={6}>
                          <FormGroup>
                            <ControlLabel>
                              From
                              <span data-for="date-tooltip" data-tip>
                                <FontAwesome
                                  icon="question-circle-o"
                                  style={styles.questionTooltip}
                                />
                                <ReactTooltip
                                  role="tooltip"
                                  id="date-tooltip"
                                  effect="solid"
                                >
                                  <div style={styles.tooltipText}>
                                    You must provide a date range in order to
                                    download submissions. If the download times
                                    out, please shorten the date range.
                                  </div>
                                </ReactTooltip>
                              </span>
                            </ControlLabel>
                            <DatePicker
                              date={this.state.startDate}
                              onChange={this.handleStartChange}
                              selectsStart
                              startDate={this.state.startDate}
                              endDate={this.state.endDate}
                              clearable
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <ControlLabel>To</ControlLabel>
                            <DatePicker
                              date={this.state.endDate}
                              onChange={this.handleEndChange}
                              selectsEnd
                              startDate={this.state.startDate}
                              endDate={this.state.endDate}
                              clearable
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  )}
                  <div>
                    <Button
                      onClick={this.handleDownloadCsvClick}
                      style={styles.downloadButton}
                      disabled={isDownloadButtonDisabled}
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
  selectRow: {
    margin: '5px 0px 5px 0px'
  },
  questionTooltip: {
    cursor: 'pointer',
    marginLeft: '0.5em',
    marginRight: '0.5em'
  },
  tooltipText: {
    maxWidth: 200
  }
};
