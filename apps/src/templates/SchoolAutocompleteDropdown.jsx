import React, { Component, PropTypes } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import i18n from "@cdo/locale";
import { styles } from './census2017/censusFormStyles';

export default class SchoolAutocompleteDropdown extends Component {
  static propTypes = {
    setField: PropTypes.func,
    showErrorMsg: PropTypes.bool,
    // Value is the NCES id of the school
    value: PropTypes.string
  };

  getOptions(q) {
    if (q.length < 4) {
      return Promise.resolve();
    }
    return fetch(`/dashboardapi/v1/schoolsearch/${encodeURIComponent(q)}/40`)
      .then(response => response.ok ? response.json() : [])
      .then(json => {
        var schools = json.map(school => ({
          value: school.nces_id.toString(),
          label: `${school.name} - ${school.city}, ${school.state} ${school.zip}`
        }));
        schools.unshift({ value: "-1", label: i18n.schoolNotFound()});
        return { options: schools };
    });
  }

  sendToParent = (event) => {
    this.props.setField("nces", event);
  }

  render() {
    return (
      <div>
        <div style={styles.question}>
          {i18n.schoolName()}
          <span style={styles.asterisk}> *</span>
          {this.props.showErrorMsg && (
            <div style={styles.errors}>
              {i18n.censusRequiredSelect()}
            </div>
          )}
        </div>
        <VirtualizedSelect
          id="nces_school"
          name="nces_school_s"
          async={true}
          loadOptions={this.getOptions}
          filterOption={() => true}
          value={this.props.value}
          onChange={this.sendToParent}
          placeholder={i18n.searchForSchool()}
        />
      </div>
    );
  }
}
