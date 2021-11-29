import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import color from '../../util/color';
import {ImageWithStatus} from '../ImageWithStatus';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import {
  featuredProjectDataPropType,
  featuredProjectTableTypes
} from './projectConstants';
import {FEATURED_PROJECT_TYPE_MAP} from './projectTypeMap';
import QuickActionsCell from '../tables/QuickActionsCell';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import PopUpMenu from '@cdo/apps/lib/ui/PopUpMenu';

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

const THUMBNAIL_SIZE = 65;

/** @enum {number} */
export const COLUMNS = {
  THUMBNAIL: 0,
  PROJECT_NAME: 1,
  APP_TYPE: 2,
  LAST_PUBLISHED: 3,
  LAST_FEATURED: 4,
  ACTIONS: 5
};

export const styles = {
  cellFirst: {
    borderWidth: '1px 0px 1px 1px',
    borderColor: color.border_light_gray
  },
  headerCellFirst: {
    borderWidth: '0px 0px 1px 0px',
    borderColor: color.border_light_gray
  },
  cellThumbnail: {
    width: THUMBNAIL_SIZE,
    minWidth: THUMBNAIL_SIZE,
    padding: 2,
    overflow: 'hidden'
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
    alignItems: 'center'
  }
};

// Cell formatters.
const thumbnailFormatter = function(thumbnailUrl, {rowData}) {
  const projectUrl = `/projects/${rowData.type}/${rowData.channel}/`;
  thumbnailUrl = thumbnailUrl || PROJECT_DEFAULT_IMAGE;
  return (
    <a
      style={tableLayoutStyles.link}
      href={projectUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ImageWithStatus
        src={thumbnailUrl}
        width={THUMBNAIL_SIZE}
        wrapperStyle={styles.thumbnailWrapper}
      />
    </a>
  );
};

const nameFormatter = (projectName, {rowData}) => {
  const url = `/projects/${rowData.type}/${rowData.channel}/`;
  return (
    <a
      style={tableLayoutStyles.link}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {projectName}
    </a>
  );
};

const unfeature = channel => {
  var url = `/featured_projects/${channel}/unfeature`;
  $.ajax({
    url: url,
    type: 'PUT',
    dataType: 'json'
  })
    .done(handleSuccess)
    .fail(handleUnfeatureFailure);
};

const handleSuccess = () => {
  window.location.reload(true);
};

const handleUnfeatureFailure = () => {
  alert('Shucks. Something went wrong - this project is still featured.');
};

const handleFeatureFailure = () => {
  alert("Shucks. Something went wrong - this project wasn't featured.");
};

const actionsFormatterFeatured = (actions, {rowData}) => {
  return (
    <QuickActionsCell>
      <PopUpMenu.Item onClick={() => unfeature(rowData.channel)}>
        {i18n.stopFeaturing()}
      </PopUpMenu.Item>
    </QuickActionsCell>
  );
};

const feature = (channel, publishedAt) => {
  var url = `/featured_projects/${channel}/feature`;
  if (!publishedAt) {
    alert(i18n.featureUnpublishedWarning());
  }
  $.ajax({
    url: url,
    type: 'PUT',
    dataType: 'json'
  })
    .done(handleSuccess)
    .fail(handleFeatureFailure);
};

const actionsFormatterUnfeatured = (actions, {rowData}) => {
  return (
    <QuickActionsCell>
      <PopUpMenu.Item
        onClick={() => feature(rowData.channel, rowData.publishedAt)}
      >
        {i18n.featureAgain()}
      </PopUpMenu.Item>
    </QuickActionsCell>
  );
};

const dateFormatter = time => {
  if (time) {
    const date = new Date(time);
    return date.toLocaleDateString();
  } else {
    return i18n.no();
  }
};

const typeFormatter = type => {
  return FEATURED_PROJECT_TYPE_MAP[type];
};

const topicFormatter = topic => {
  return topic;
};

class FeaturedProjectsTable extends React.Component {
  static propTypes = {
    projectList: PropTypes.arrayOf(featuredProjectDataPropType).isRequired,
    tableVersion: PropTypes.oneOf(Object.values(featuredProjectTableTypes))
      .isRequired
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
  onSort = selectedColumn => {
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

  getColumns = sortable => {
    const tableVersion = this.props.tableVersion;
    const dataColumns = [
      {
        property: 'thumbnailUrl',
        header: {
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.headerCellFirst,
              ...styles.headerCellThumbnail,
              ...tableLayoutStyles.unsortableHeader
            }
          }
        },
        cell: {
          formatters: [thumbnailFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.cellFirst,
              ...styles.cellThumbnail
            }
          }
        }
      },
      {
        property: 'projectName',
        header: {
          label: i18n.projectName(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.headerCellName
            }
          }
        },
        cell: {
          formatters: [nameFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.cellName
            }
          }
        }
      },
      {
        property: 'type',
        header: {
          label: i18n.projectType(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable]
        },
        cell: {
          formatters: [typeFormatter],
          props: {
            style: {
              ...styles.cellType,
              ...tableLayoutStyles.cell
            }
          }
        }
      },
      {
        property: 'topic',
        header: {
          label: 'Topic',
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable]
        },
        cell: {
          formatters: [topicFormatter],
          props: {
            style: {
              ...styles.cellType,
              ...tableLayoutStyles.cell
            }
          }
        }
      },
      {
        property: 'publishedAt',
        header: {
          label: i18n.published(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable]
        },
        cell: {
          formatters: [dateFormatter],
          props: {style: tableLayoutStyles.cell}
        }
      },
      {
        property: 'featuredAt',
        header: {
          label: i18n.featured(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable]
        },
        cell: {
          formatters: [dateFormatter],
          props: {style: tableLayoutStyles.cell}
        }
      }
    ];
    const archiveColumns = [
      {
        property: 'unfeaturedAt',
        header: {
          label: i18n.unfeatured(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable]
        },
        cell: {
          formatters: [dateFormatter],
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
              ...tableLayoutStyles.unsortableHeader
            }
          }
        },
        cell: {
          formatters: [actionsFormatterUnfeatured],
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
              ...tableLayoutStyles.unsortableHeader
            }
          }
        },
        cell: {
          formatters: [actionsFormatterFeatured],
          props: {style: tableLayoutStyles.cell}
        }
      }
    ];

    if (tableVersion === 'currentFeatured') {
      return dataColumns.concat(currentColumns);
    } else {
      return dataColumns.concat(archiveColumns);
    }
  };

  render() {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      sortableOptions
    );
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy
    })(this.props.projectList);

    return (
      <Table.Provider columns={columns} style={tableLayoutStyles.table}>
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="channel" />
      </Table.Provider>
    );
  }
}

export default FeaturedProjectsTable;
