import React from 'react';
import {Table} from 'reactabular';

const styles = {
  cell: {
    border: '1px solid gray',
    padding: 5,
  }
};

/**
 * Map from project type to friendly name.
 * @type {Object}
 */
const PROJECT_TYPE_MAP = {
  applab: 'App Lab',
  gamelab: 'Game Lab',
};

function typeFormatter(type) {
  return PROJECT_TYPE_MAP[type];
}

/**
 * Takes a date formatted as YYYY-MM-DD and returns it as MM/DD/YYYY.
 * @param {string} date
 * @returns {string}
 */
function dateFormatter(date) {
  const result = date.match(/^(\d\d\d\d)-(\d\d)-(\d\d)$/);
  if (!result) {
    return date;
  }
  const [year, month, day] = result.slice(1, 4);
  return `${month}/${day}/${year}`;
}

/**
 * Looks up the channel id and the project type in the row data, to generate
 * a URL to decorate the project name with.
 * @param {string} name Project name.
 * @param {string} metadata.rowData.type Project type (e.g. 'applab').
 * @param {string} metadata.rowData.channel Encrypted, base64-encoded channel id.
 * @returns {React} A named link to the specified project.
 */
function nameFormatter(name, metadata) {
  const {rowData} = metadata;

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
        },
        cell: {
          format: nameFormatter,
          props: {style: styles.cell}
        }
      },
      {
        property: 'studentName',
        header: {
          label: 'Student Name',
        },
        cell: {
          props: {style: styles.cell}
        }
      },
      {
        property: 'type',
        header: {
          label: 'Type',
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
      <div>
        <h2>my projects list</h2>
        <Table.Provider
          className="pure-table pure-table-striped"
          columns={this.getColumns()}
        >
          <Table.Header />

          <Table.Body rows={this.props.projectsData} rowKey="updatedAt" />
        </Table.Provider>
      </div>
    );
  }
});
export default ProjectsList;
