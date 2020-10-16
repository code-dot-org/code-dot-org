import React from 'react';
import PropTypes from 'prop-types';
import {Modal, MenuItem, DropdownButton, Button} from 'react-bootstrap';
import 'react-select/dist/react-select.css';
import Spinner from '../../../components/spinner';
import Select from 'react-select/lib/Select';

const CSV_QUERY_URL = '/api/v1/pd/foorm/submissions_csv';
const FORM_NAME_QUERY_URL = '/api/v1/pd/foorm/form_names';

const styles = {
  modalHeader: {
    padding: '0 15px 0 0',
    height: 30,
    borderBottom: 'none'
  },
  modalBody: {
    padding: '0 15px 15px 15px',
    fontSize: 14,
    lineHeight: '22px'
  }
};

export default class SubmissionsReport extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    children: PropTypes.node.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      formNamesAndVersions: null,
      loadingFormNames: false,
      loadingCsv: false,
      selectedForm: {name: '', version: ''},
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

  getFormattedFormNameDropdownOptions() {
    return this.state.formNamesAndVersions.map((formNameAndVersion, i) => {
      const formName = formNameAndVersion['name'];
      const formVersion = formNameAndVersion['version'];
      return (
        <MenuItem
          key={i}
          eventKey={i}
          onClick={() =>
            this.setState({
              selectedForm: {name: formName, version: formVersion}
            })
          }
        >
          {`${formName}, version ${formVersion}`}
        </MenuItem>
      );
    });
  }

  getFormattedFormNameSelectOptions() {
    return this.state.formNamesAndVersions.map((formNameAndVersion, i) => {
      const formName = formNameAndVersion['name'];
      const formVersion = formNameAndVersion['version'];
      return {
        value: {name: formName, version: formVersion},
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
    this.setState({selectedForm: change.value});
  };

  handleDownloadCsvClick = () => {
    this.setState({loadingCsv: true});
    this.loadRequest = $.ajax({
      method: 'GET',
      url: CSV_QUERY_URL,
      data: this.state.selectedForm
    }).done(() => {
      this.setState({
        loadingCsv: false
      });
      window.open(`${CSV_QUERY_URL}${this.getQueryParams()}.csv`);
    });
  };

  render_old() {
    // <Modal>
    //   <Modal.Header closeButton style={styles.modalHeader} />
    //   <Modal.Body style={styles.modalBody}>
    if (!this.state.formNamesAndVersions) {
      return <Spinner />;
    } else {
      return (
        <div>
          <DropdownButton id="load_config" title="Select Survey">
            {this.getFormattedFormNameDropdownOptions()}
          </DropdownButton>
          <Button onClick={this.handleDownloadCsvClick}>Download CSV</Button>
        </div>
      );
    }

    //   </Modal.Body>
    // </Modal>
  }

  render() {
    return (
      <span>
        <span onClick={this.open}>{this.props.children}</span>
        <Modal show={this.state.showing} onHide={this.close}>
          <Modal.Header closeButton style={styles.modalHeader} />
          <Modal.Body style={styles.modalBody}>
            <div>
              {this.state.formNamesAndVersions && (
                <div>
                  <Select
                    options={this.getFormattedFormNameSelectOptions()}
                    onChange={this.onSelectChange}
                  />
                  <DropdownButton id="load_config" title="Select Survey">
                    {this.getFormattedFormNameDropdownOptions()}
                  </DropdownButton>
                  <Button onClick={this.handleDownloadCsvClick}>
                    Download CSV
                  </Button>
                </div>
              )}
            </div>
          </Modal.Body>
        </Modal>
      </span>
    );
  }
}
