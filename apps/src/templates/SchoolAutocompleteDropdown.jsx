import React, { Component, PropTypes } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import i18n from "@cdo/locale";
import color from "../util/color";
import SchoolNotFound from './SchoolNotFound';


const styles = {
  question: {
    fontSize: 16,
    fontFamily: '"Gotham 3r", sans-serif',
    color: color.charcoal,
    paddingTop: 10,
    paddingBottom: 5
  },
  asterisk: {
    fontSize: 20,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.red,
  },
};

export default class SchoolAutocompleteDropdown extends Component {
  static propTypes = {
    // This prop allows us to handle special cases where even if the school is // not found via the school autocomplete dropdown, we do NOT want to show
    // the default SchooNotFound input fields. Specifically, on the Hour of
    // Code signup form, the school location is entered via a Google maps
    // lookup to support the functionality of the map on that page.
    overrideSchoolNotFound: PropTypes.bool
  };

  state = {
    selectValue: {value: 0, label: ""}
  };

  getOptions(q) {
    if (q.length < 4) {
      return Promise.resolve();
    }
    return fetch(`/dashboardapi/v1/schoolsearch/${encodeURIComponent(q)}/40`)
      .then(response => response.json())
      .then(json => {
        var schools = json.map(school => ({
          value: school.nces_id,
          label: `${school.name} - ${school.city}, ${school.state} ${school.zip}`
        }));
        schools.unshift({ value: -1, label: i18n.schoolNotFound()});
        return { options: schools };
    });
  }

  render() {
    const schoolNotFound = this.state.selectValue &&  this.state.selectValue.value === -1;
    const {overrideSchoolNotFound} = this.props;

    return (
      <div>
        <div style={styles.question}>
          {i18n.schoolName()}
          <span style={styles.asterisk}> *</span>
        </div>
        <VirtualizedSelect
          id="nces_school"
          name="nces_school_s"
          async={true}
          loadOptions={this.getOptions}
          filterOption={() => true}
          value={this.state.selectValue}
          onChange={(selectValue) => this.setState({ selectValue })}
        />
        {schoolNotFound && !overrideSchoolNotFound && (
          <SchoolNotFound/>
        )}
      </div>
    );
  }
}
