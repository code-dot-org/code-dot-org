import React, {PropTypes} from 'react';
import $ from 'jquery';
import 'selectize';

const styles = {
  standard: {
    width: 250
  }
};

export default class ShoolAutocomplete extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  };

  componentDidMount() {
    $('#' + this.props.id).selectize({
      maxItems: 1,
      load: function(q, callback) {
        if (!q.length) {
            return callback();
        }
        $.ajax({
          url: 'http://localhost-studio.code.org:3000/dashboardapi/v1/schoolsearch/' + encodeURIComponent(q) + '/40',
          type: 'GET',
          error: function() {
            callback();
          },
          success: function(data) {
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
    return (
      <div>
        <select id={this.props.id} name={this.props.name} style={styles.standard}>
        </select>
      </div>
    );
  }

}
