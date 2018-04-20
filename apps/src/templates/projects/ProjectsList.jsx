import React, {PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import {tableLayoutStyles} from "../tables/tableConstants";
import color from "../../util/color";
import commonMsg from '@cdo/locale';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import {ImageWithStatus} from '../ImageWithStatus';
import {PROJECT_TYPE_MAP} from './projectConstants';

const THUMBNAIL_SIZE = 50;

/** @enum {number} */
export const COLUMNS = {
  THUMBNAIL: 0,
  PROJECT_NAME: 1,
  STUDENT_NAME: 2,
  APP_TYPE: 3,
  LAST_EDITED: 4,
};

/** @enum {number} */
export const COLUMNS_WITHOUT_THUMBNAILS = {
  PROJECT_NAME: 0,
  STUDENT_NAME: 1,
  APP_TYPE: 2,
  LAST_EDITED: 3,
};

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
  thumbnailCell: {
    border: '1px solid gray',
    width: THUMBNAIL_SIZE,
    minWidth: THUMBNAIL_SIZE,
    padding: 0
  },
  thumbnailWrapper: {
    height: THUMBNAIL_SIZE,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const typeFormatter = (type) => {
  return PROJECT_TYPE_MAP[type];
};

/**
 * Takes a date formatted as YYYY-MM-DD and returns it as MM/DD/YYYY.
 * @param {string} dateString
 * @returns {string}
 */
const dateFormatter = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const thumbnailFormatter = (thumbnailUrl) => {
  return thumbnailUrl ?
    <ImageWithStatus
      src={thumbnailUrl}
      width={THUMBNAIL_SIZE}
      wrapperStyle={styles.thumbnailWrapper}
    /> :
    '';
};

class ProjectsList extends React.Component {
  static propTypes = {
    projectsData: PropTypes.array.isRequired,
    // The prefix for the code studio url in the current environment,
    // e.g. '//studio.code.org' or '//localhost-studio.code.org:3000'.
    studioUrlPrefix: PropTypes.string.isRequired,
    showProjectThumbnails: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    const sortingColumn = this.props.showProjectThumbnails ?
      COLUMNS.LAST_EDITED : COLUMNS_WITHOUT_THUMBNAILS.LAST_EDITED;
    this.state = {
      sortingColumns: {
        [sortingColumn]: {
          direction: 'desc',
          position: 0
        }
      }
    };
  }

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  // The user requested a new sorting column. Adjust the state accordingly.
  onSort = (selectedColumn) => {
    this.setState({
      sortingColumns: sort.byColumn({
        sortingColumns: this.state.sortingColumns,
        // Custom sortingOrder removes 'no-sort' from the cycle
        sortingOrder: {
          FIRST: 'asc',
          asc: 'desc',
          desc: 'asc'
        },
        selectedColumn
      })
    });
  };

  /**
   * Looks up the channel id and the project type in the row data, to generate
   * a URL to decorate the project name with.
   * @param {string} name Project name.
   * @param {Object} rowData
   * @param {string} rowData.type Project type (e.g. 'applab').
   * @param {string} rowData.channel Encrypted, base64-encoded channel id.
   * @returns {React} A named link to the specified project.
   */
  nameFormatter = (name, {rowData}) => {
    // Avoid generating malicious URLs in case the user somehow manipulates these inputs.
    const type = encodeURIComponent(rowData.type);
    const channel = encodeURIComponent(rowData.channel);

    const url = `${this.props.studioUrlPrefix}/projects/${type}/${channel}/view`;
    return <a href={url} style={tableLayoutStyles.link} target="_blank">{name}</a>;
  };

  getColumns = (sortable) => {
    const thumbnailColumn = {
      property: 'thumbnailUrl',
      header: {
        props: {style:tableLayoutStyles.headerCell},
      },
      cell: {
        format: thumbnailFormatter,
        props: {style: tableLayoutStyles.cell},
      }
    };
    const standardColumns = [
      {
        property: 'name',
        header: {
          label: commonMsg.projectName(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: this.nameFormatter,
          props: {style: tableLayoutStyles.cell},
        }
      },
      {
        property: 'studentName',
        header: {
          label: commonMsg.studentName(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          props: {style: tableLayoutStyles.cell}
        }
      },
      {
        property: 'type',
        header: {
          label: commonMsg.projectType(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: typeFormatter,
          props: {style: tableLayoutStyles.cell},
        }
      },
      {
        property: 'updatedAt',
        header: {
          label: commonMsg.lastEdited(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: dateFormatter,
          props: {style: tableLayoutStyles.cell},
        }
      },
    ];

    return this.props.showProjectThumbnails ?
      [thumbnailColumn].concat(standardColumns) : standardColumns;
  };

  render() {
    const sortableOptions = {
      // Dim inactive sorting icons in the column headers
      default: {color: 'rgba(255, 255, 255, 0.2 )'}
    };

    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, sortableOptions);
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy,
    })(this.props.projectsData);

    return (
      <Table.Provider
        className="pure-table pure-table-striped"
        columns={columns}
        style={tableLayoutStyles.table}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="channel" />
      </Table.Provider>
    );
  }
}

export default ProjectsList;
