import React, { PropTypes, Component } from 'react';
import ProtectedStatefulDiv from '../templates/ProtectedStatefulDiv';
import $ from 'jquery';
import 'selectize';


const styles = {
  searchBox: {
    width: 500,
    height: 50
  }
};

export default class SchoolAutocompleteDropdown extends Component {

  componentDidMount() {
    $('#nces_school').selectize({
      maxItems: 1,
      valueField: 'text',
      /* onChange: this.setState(isSchoolNotFound, selectedValue == -1) */

      load: function (q, callback) {
        if (!q.length) {
          return callback();
        }
        $.ajax({
          url: '/dashboardapi/v1/schoolsearch/' + encodeURIComponent(q) + '/40',
          type: 'GET',
          error: function () {
            callback();
          },
          success: function (data) {
            var schools = [];
            for (var i = 0; i < data.length; i++) {
              schools.push({
                value: data[i].id,
                text: data[i].name + ' - ' + data[i].city + ', ' + data[i].state + ' ' + data[i].zip
              });
            }
            callback(schools);
          }
        });
      }
    });
  }

  render() {
    const $select = $('#nces_school').selectize;
    console.log ("$select", $select)
    // const selectize = $select[0].selectize;
    // selectize.addOption({id: -1, label: 'School not found'});
    // selectize.refreshOptions();
    // selectize.addItem(-1);

    return (
      <div id="container">
        <ProtectedStatefulDiv id="psd">
          <select
            id="nces_school"
            name="nces_school_i" style={styles.searchBox}
          >
          </select>
        </ProtectedStatefulDiv>
      </div>
    );
  }
}
