import React from 'react';
import {Table} from 'reactabular';
import color from "../../util/color";
import commonMsg from '@cdo/locale';

const styles = {
  table: {
    width: '100%',
  },
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

const ProjectsList = React.createClass({
  propTypes: {
    projectsData: React.PropTypes.array.isRequired,
    // The prefix for the code studio url in the current environment,
    // e.g. '//studio.code.org' or '//localhost-studio.code.org:3000'.
    studioUrlPrefix: React.PropTypes.string.isRequired,
  },

  /**
   * Looks up the channel id and the project type in the row data, to generate
   * a URL to decorate the project name with.
   * @param {string} name Project name.
   * @param {Object} rowData
   * @param {string} rowData.type Project type (e.g. 'applab').
   * @param {string} rowData.channel Encrypted, base64-encoded channel id.
   * @returns {React} A named link to the specified project.
   */
  nameFormatter(name, {rowData}) {
    // Avoid generating malicious URLs in case the user somehow manipulates these inputs.
    const type = encodeURIComponent(rowData.type);
    const channel = encodeURIComponent(rowData.channel);

    const url = `${this.props.studioUrlPrefix}/projects/${type}/${channel}/view`;
    return <a href={url} target="_blank">{name}</a>;
  },

  getColumns() {
    return [
      {
        property: 'name',
        header: {
          label: commonMsg.projectName(),
          props: {style: styles.headerCell},
        },
        cell: {
          format: this.nameFormatter,
          props: {style: styles.nameCell}
        }
      },
      {
        property: 'studentName',
        header: {
          label: commonMsg.studentName(),
          props: {style: styles.headerCell},
        },
        cell: {
          props: {style: styles.cell}
        }
      },
      {
        property: 'type',
        header: {
          label: commonMsg.projectType(),
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
          label: commonMsg.lastEdited(),
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
        style={styles.table}
      >
        <Table.Header />

        <Table.Body rows={this.props.projectsData} rowKey="channel" />
      </Table.Provider>
    );
  }
});
export default ProjectsList;
