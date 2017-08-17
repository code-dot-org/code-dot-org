import React, {PropTypes} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from "@cdo/locale";
import color from "../../util/color";
import {ImageWithStatus} from '../ImageWithStatus';
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import {PROJECT_TYPE_MAP, personalProjectDataPropType} from './projectConstants';
import QuickActionsCell from './QuickActionsCell';

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

const THUMBNAIL_SIZE = 65;

/** @enum {number} */
export const COLUMNS = {
  THUMBNAIL: 0,
  PROJECT_NAME: 1,
  APP_TYPE: 2,
  LAST_EDITED: 3,
  PUBLIC_GALLERY: 4,
  ACTIONS: 5,
};

const styles = {
  table: {
    width: 970,
    borderRadius: 5,
    color: color.charcoal,
    backgroundColor: color.table_light_row
  },
  cell: {
    border: '1px solid',
    borderColor: color.border_light_gray,
    padding: 10,
    fontSize: 14,
  },
  headerCell: {
    border: '1px solid',
    borderColor: color.border_light_gray,
    padding: 20,
    backgroundColor: color.lightest_gray,
    color: color.charcoal
  },
  cellThumbnail: {
    borderWidth: '1px 0px 1px 1px',
    borderColor: color.border_light_gray,
    width: THUMBNAIL_SIZE,
    minWidth: THUMBNAIL_SIZE,
    padding: 2
  },
  headerCellThumbnail: {
    borderWidth: '1px 0px 1px 1px',
    borderColor: color.border_light_gray,
    padding: 0
  },
  cellName: {
    borderWidth: '1px 1px 1px 0px',
    borderColor: color.border_light_gray,
    padding: 15,
    width: 270
  },
  headerCellName: {
    borderWidth: '1px 1px 1px 0px',
    borderColor: color.border_light_gray,
    padding: 15
  },
  cellType: {
    width: 120
  },
  cellIsPublished: {
    textAlign: 'center'
  },
  thumbnailWrapper: {
    height: THUMBNAIL_SIZE,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    textDecoration: 'none'
  }
};

// Cell formatters.
const thumbnailFormatter = function (thumbnailUrl) {
  thumbnailUrl = thumbnailUrl || PROJECT_DEFAULT_IMAGE;
  return (<ImageWithStatus
    src={thumbnailUrl}
    width={THUMBNAIL_SIZE}
    wrapperStyle={styles.thumbnailWrapper}
          />);
};

const nameFormatter = function (name, {rowData}) {
  const url = '/projects/${rowData.type}/${rowData.channel}/';
  return <a style={styles.link} href={url} target="_blank">{name}</a>;
};

const isPublishedFormatter = function (isPublished) {
  return isPublished ? (<FontAwesome icon="circle"/>) : '';
};

const actionsFormatter = function (actions, {rowData}) {
  return (
    <QuickActionsCell projectData={rowData} />
  );
};

const dateFormatter = function (time) {
  const date = new Date(time);
  return date.toLocaleDateString();
};

const typeFormatter = function (type) {
  return PROJECT_TYPE_MAP[type];
};

// Table of user's projects
// TODO(caleybrock): add an actions component to allow users to modify projects
const PersonalProjectsTable = React.createClass({
  propTypes: {
    projectList: PropTypes.arrayOf(personalProjectDataPropType).isRequired
  },

  getInitialState() {
    const sortingColumns = {
      [COLUMNS.LAST_EDITED]: {
        direction: 'desc',
        position: 0
      }
    };
    return {sortingColumns};
  },

  getSortingColumns() {
    return this.state.sortingColumns || {};
  },

  // The user requested a new sorting column. Adjust the state accordingly.
  onSort(selectedColumn) {
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
  },

  getColumns(sortable) {
    return [
      {
        property: 'thumbnailUrl',
        header: {
          props: {style: {
            ...styles.headerCell,
            ...styles.headerCellThumbnail
          }},
        },
        cell: {
          format: thumbnailFormatter,
          props: {style: {
            ...styles.cell,
            ...styles.cellThumbnail
          }}
        }
      },
      {
        property: 'name',
        header: {
          label: i18n.projectName(),
          props: {style: {
            ...styles.headerCell,
            ...styles.headerCellName
          }},
        },
        cell: {
          format: nameFormatter,
          props: {style: {
            ...styles.cell,
            ...styles.cellName
          }}
        }
      },
      {
        property: 'type',
        header: {
          label: i18n.projectType(),
          props: {style: styles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: typeFormatter,
          props: {style: {
            ...styles.cellType,
            ...styles.cell
          }}
        }
      },
      {
        property: 'updatedAt',
        header: {
          label: i18n.lastEdited(),
          props: {style: styles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: dateFormatter,
          props: {style: styles.cell}
        }
      },
      {
        property: 'isPublished',
        header: {
          label: i18n.publicGallery(),
          props: {style: styles.headerCell},
        },
        cell: {
          format: isPublishedFormatter,
          props: {style: {
            ...styles.cell,
            ...styles.cellIsPublished
          }}
        }
      },
      {
        property: 'actions',
        header: {
          label: i18n.quickActions(),
          props: {style: styles.headerCell},
        },
        cell: {
          format: actionsFormatter,
          props: {style: styles.cell}
        }
      }
    ];
  },

  render() {
    const sortableOptions = {
      // Dim inactive sorting icons in the column headers
      default: {color: 'rgba(0, 0, 0, 0.2 )'}
    };

    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, sortableOptions);
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy,
    })(this.props.projectList);

    return (
      <Table.Provider
        columns={columns}
        style={styles.table}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="channel" />
      </Table.Provider>
    );
  }
});

export default PersonalProjectsTable;
