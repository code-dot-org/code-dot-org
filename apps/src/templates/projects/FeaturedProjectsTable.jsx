import React, {PropTypes} from 'react';
import i18n from "@cdo/locale";
import color from "../../util/color";
import {ImageWithStatus} from '../ImageWithStatus';
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import {PROJECT_TYPE_MAP, featuredProjectDataPropType} from './projectConstants';
import QuickActionsCell from '../tables/QuickActionsCell';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import PopUpMenu from "@cdo/apps/lib/ui/PopUpMenu";

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

const THUMBNAIL_SIZE = 65;

/** @enum {number} */
export const COLUMNS = {
  THUMBNAIL: 0,
  PROJECT_NAME: 1,
  APP_TYPE: 2,
  LAST_PUBLISHED: 3,
  LAST_FEATURED: 4,
  ACTIONS: 5,
};

export const styles = {
  cellFirst: {
    borderWidth: '1px 0px 1px 1px',
    borderColor: color.border_light_gray,
  },
  headerCellFirst: {
    borderWidth: '0px 0px 1px 0px',
    borderColor: color.border_light_gray,
  },
  cellThumbnail: {
    width: THUMBNAIL_SIZE,
    minWidth: THUMBNAIL_SIZE,
    padding: 2
  },
  headerCellThumbnail: {
    padding: 0
  },
  cellName: {
    borderWidth: '1px 1px 1px 0px',
    borderColor: color.border_light_gray,
    padding: 15,
    width: 250
  },
  headerCellName: {
    borderWidth: '0px 1px 1px 0px',
    borderColor: color.border_light_gray,
    padding: 15
  },
  cellType: {
    width: 120
  },
  thumbnailWrapper: {
    height: THUMBNAIL_SIZE,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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

const nameFormatter = (projectName, {rowData}) => {
  const url = '/projects/${rowData.type}/${rowData.channel}/';
  return <a style={tableLayoutStyles.link} href={url} target="_blank">{projectName}</a>;
};

const actionsFormatterFeatured = (actions, {rowData}) => {
  return (
    <QuickActionsCell>
      <PopUpMenu.Item
        onClick={() => {}}
      >
        {i18n.stopFeaturing()}
      </PopUpMenu.Item>
    </QuickActionsCell>
  );
};

const actionsFormatterUnfeatured = (actions, {rowData}) => {
  return (
    <QuickActionsCell>
      <PopUpMenu.Item
        onClick={() => {}}
      >
        {i18n.featureAgain()}
      </PopUpMenu.Item>
    </QuickActionsCell>
  );
};

const dateFormatter = (time) => {
  const date = new Date(time);
  return date.toLocaleDateString();
};

const typeFormatter = (type) => {
  return PROJECT_TYPE_MAP[type];
};

class FeaturedProjectsTable extends React.Component {
  static propTypes = {
    projectList: PropTypes.arrayOf(featuredProjectDataPropType).isRequired,
    tableVersion: PropTypes.oneOf(['currentFeatured', 'archiveFeatured']).isRequired
  };

  state = {
    [COLUMNS.PROJECT_NAME]: {
      direction: 'desc',
      position: 0
    }
  };

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

  getColumns = (sortable) => {
    const tableVersion = this.props.tableVersion;
    const dataColumns = [
      {
        property: 'thumbnailUrl',
        header: {
          props: {style: {
            ...tableLayoutStyles.headerCell,
            ...styles.headerCellFirst,
            ...styles.headerCellThumbnail,
            ...tableLayoutStyles.unsortableHeader,
          }},
        },
        cell: {
          format: thumbnailFormatter,
          props: {style: {
            ...tableLayoutStyles.cell,
            ...styles.cellFirst,
            ...styles.cellThumbnail
          }}
        }
      },
      {
        property: 'projectName',
        header: {
          label: i18n.projectName(),
          props: {style: {
            ...tableLayoutStyles.headerCell,
            ...styles.headerCellName,
          }},
        },
        cell: {
          format: nameFormatter,
          props: {style: {
            ...tableLayoutStyles.cell,
            ...styles.cellName
          }}
        }
      },
      {
        property: 'type',
        header: {
          label: i18n.projectType(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: typeFormatter,
          props: {style: {
            ...styles.cellType,
            ...tableLayoutStyles.cell
          }}
        }
      },
      {
        property: 'publishedAt',
        header: {
          label: i18n.published(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: dateFormatter,
          props: {style: tableLayoutStyles.cell}
        }
      },
      {
        property: 'featuredAt',
        header: {
          label: i18n.featured(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: dateFormatter,
          props: {style: tableLayoutStyles.cell}
        }
      },
    ];
    const archiveColumns = [
      {
        property: 'unfeaturedAt',
        header: {
          label: i18n.unfeatured(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: dateFormatter,
          props: {style: tableLayoutStyles.cell}
        }
      },
      {
        property: 'actions',
        header: {
          label: i18n.quickActions(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...tableLayoutStyles.unsortableHeader,
            }
          },
        },
        cell: {
          format: actionsFormatterUnfeatured,
          props: {style: tableLayoutStyles.cell}
        }
      }
    ];
    const currentColumns = [
      {
        property: 'actions',
        header: {
          label: i18n.quickActions(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...tableLayoutStyles.unsortableHeader,
            }
          },
        },
        cell: {
          format: actionsFormatterFeatured,
          props: {style: tableLayoutStyles.cell}
        }
      }
    ];

    if (tableVersion === "currentFeatured") {
      return dataColumns.concat(currentColumns);
    } else {
      return dataColumns.concat(archiveColumns);
    }
  };

  render() {
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
        style={tableLayoutStyles.table}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="projectName" />
      </Table.Provider>
    );
  }
}

export default FeaturedProjectsTable;
