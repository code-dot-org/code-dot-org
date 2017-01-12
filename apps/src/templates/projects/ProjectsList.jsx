import React from 'react';
import {Table} from 'reactabular';

const ProjectsList = React.createClass({
  propTypes: {
    projectsData: React.PropTypes.array.isRequired,
  },

  getColumns() {
    return [
      {
        property: 'studentName',
        header: {
          label: 'Student Name',
        }
      },
      {
        property: 'name',
        header: {
          label: 'Project Name',
        }
      },
      {
        property: 'type',
        header: {
          label: 'Project Type',
        }
      },
      {
        property: 'updatedAt',
        header: {
          label: 'Last Edited',
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
