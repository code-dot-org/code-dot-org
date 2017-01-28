import React from 'react';
import {Table} from 'reactabular';
import color from "../../util/color";
import commonMsg from '@cdo/locale';

const styles = {
  cell: {
    border: '1px solid gray',
    padding: 10,
    fontSize: 14,
  },
  nameCell: {
    border: '1px solid gray',
    padding: 10,
    fontSize: 14,
    fontFamily: '"Gotham 5r", sans-serif',
  },
  headerCell: {
    border: '1px solid gray',
    padding: 10,
    backgroundColor: color.teal,
  },
};

/**
 * Map from project type to friendly name.
 * @type {Object}
 */
const PROJECT_TYPE_MAP = {
  algebra_game: commonMsg.projectTypeAlgebra(),
  applab: commonMsg.projectTypeApplab(),
  artist: commonMsg.projectTypeArtist(),
  gamelab: commonMsg.projectTypeGamelab(),
  playlab: commonMsg.projectTypePlaylab(),
  weblab: commonMsg.projectTypeWeblab(),
};

function typeFormatter(type) {
  return PROJECT_TYPE_MAP[type];
}

/**
 * Takes a date formatted as YYYY-MM-DD and returns it as MM/DD/YYYY.
 * @param {string} date
 * @returns {string}
 */
function dateFormatter(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Looks up the channel id and the project type in the row data, to generate
 * a URL to decorate the project name with.
 * @param {string} name Project name.
 * @param {Object} rowData
 * @param {string} rowData.type Project type (e.g. 'applab').
 * @param {string} rowData.channel Encrypted, base64-encoded channel id.
 * @returns {React} A named link to the specified project.
 */
function nameFormatter(name, {rowData}) {
  // Avoid generating malicious URLs in case the user somehow manipulates these inputs.
  const type = encodeURIComponent(rowData.type);
  const channel = encodeURIComponent(rowData.channel);

  const url = `/projects/${type}/${channel}`;
  return <a href={url} target="_blank">{name}</a>;
}

const ProjectsList = React.createClass({
  propTypes: {
    projectsData: React.PropTypes.array.isRequired,
  },

  getColumns() {
    return [
      {
        property: 'name',
        header: {
          label: 'Project Name',
          props: {style: styles.headerCell},
        },
        cell: {
          format: nameFormatter,
          props: {style: styles.nameCell}
        }
      },
      {
        property: 'studentName',
        header: {
          label: 'Student Name',
          props: {style: styles.headerCell},
        },
        cell: {
          props: {style: styles.cell}
        }
      },
      {
        property: 'type',
        header: {
          label: 'Type',
          props: {style: styles.headerCell},
        },
        cell: {
          format: typeFormatter,
          props: {style: styles.cell}
        }
      },
      {
        property: 'updatedAt',
        header: {
          label: 'Last Edited',
          props: {style: styles.headerCell},
        },
        cell: {
          format: dateFormatter,
          props: {style: styles.cell}
        }
      },
    ];
  },

  render() {
    return (
      <Table.Provider
        className="pure-table pure-table-striped"
        columns={this.getColumns()}
      >
        <Table.Header />

        <Table.Body rows={this.props.projectsData} rowKey="channel" />
      </Table.Provider>
    );
  }
});
export default ProjectsList;
