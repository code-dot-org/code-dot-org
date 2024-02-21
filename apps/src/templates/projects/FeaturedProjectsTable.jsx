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
  featuredProjectStatuses,
} from './projectConstants';
import {FEATURED_PROJECT_TYPE_MAP} from './projectTypeMap';
import QuickActionsCell from '../tables/QuickActionsCell';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import PopUpMenu, {MenuBreak} from '@cdo/apps/lib/ui/PopUpMenu';
import HttpClient from '@cdo/apps/util/HttpClient';
import experiments from '@cdo/apps/util/experiments';
import SimpleDropdown from '@cdo/apps/componentLibrary/simpleDropdown/SimpleDropdown';

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

const THUMBNAIL_SIZE = 65;

/** @enum {number} */
export const COLUMNS = {
  THUMBNAIL: 0,
  PROJECT_NAME: 1,
  APP_TYPE: 2,
  STATUS: 3,
  LAST_PUBLISHED: 4,
  LAST_FEATURED: 5,
  ACTIONS: 6,
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
    padding: 2,
    overflow: 'hidden',
  },
  headerCellThumbnail: {
    padding: 0,
  },
  cellName: {
    borderWidth: '1px 1px 1px 0px',
    borderColor: color.border_light_gray,
    padding: 15,
    width: 250,
  },
  headerCellName: {
    borderWidth: '0px 1px 1px 0px',
    borderColor: color.border_light_gray,
    padding: 15,
  },
  cellType: {
    width: 120,
  },
  thumbnailWrapper: {
    height: THUMBNAIL_SIZE,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

// Cell formatters.
const thumbnailFormatter = function (thumbnailUrl, {rowData}) {
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
  const url = `/featured_projects/${channel}/unfeature`;
  HttpClient.put(url, undefined, true)
    .then(handleSuccess)
    .catch(handleUnfeatureFailure);
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

const feature = (channel, publishedAt) => {
  const url = `/featured_projects/${channel}/feature`;
  if (!publishedAt) {
    alert(i18n.featureUnpublishedWarning());
  }
  HttpClient.put(url, undefined, true)
    .then(handleSuccess)
    .catch(handleFeatureFailure);
};

const onDelete = channel => {
  const url = `/featured_projects/${channel}`;
  HttpClient.delete(url, true).then(handleSuccess).catch(handleFeatureFailure);
};

const actionsFormatter = (actions, {rowData}) => {
  const status = rowData.status; // active, archived, bookmarked
  return (
    <QuickActionsCell>
      {status !== featuredProjectStatuses.active && (
        <PopUpMenu.Item
          onClick={() => feature(rowData.channel, rowData.publishedAt)}
        >
          Feature
        </PopUpMenu.Item>
      )}
      {status === featuredProjectStatuses.active && (
        <PopUpMenu.Item onClick={() => unfeature(rowData.channel)}>
          Unfeature
        </PopUpMenu.Item>
      )}
      <MenuBreak />
      <PopUpMenu.Item
        onClick={() => onDelete(rowData.channel)}
        color={color.red}
      >
        Remove
      </PopUpMenu.Item>
    </QuickActionsCell>
  );
};

const dateFormatter = time => {
  if (time) {
    let date = new Date(time);
    // Format date so that single digits have a leading zero.
    // This allows sorting by date to work correctly.
    const dateString =
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '/' +
      ('0' + date.getDate()).slice(-2) +
      '/' +
      date.getFullYear();
    return dateString;
  } else {
    return 'N/A';
  }
};

const typeFormatter = type => {
  return FEATURED_PROJECT_TYPE_MAP[type];
};

const statusFormatter = status => {
  return status;
};

const topicFormatter = topic => {
  return topic;
};

class FeaturedProjectsTable extends React.Component {
  static propTypes = {
    activeList: PropTypes.arrayOf(featuredProjectDataPropType).isRequired,
    bookmarkedList: PropTypes.arrayOf(featuredProjectDataPropType).isRequired,
    archivedList: PropTypes.arrayOf(featuredProjectDataPropType).isRequired,
  };

  state = {
    [COLUMNS.PROJECT_NAME]: {
      direction: 'desc',
      position: 0,
    },
    filterDropdownStatusValue: 'all',
  };

  setFilterDropdownStatusValue = value => {
    this.setState({filterDropdownStatusValue: value});
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  getProjectList = () => {
    if (this.state.filterDropdownStatusValue === 'active') {
      return this.props.activeList;
    } else if (this.state.filterDropdownStatusValue === 'bookmarked') {
      return this.props.bookmarkedList;
    } else if (this.state.filterDropdownStatusValue === 'archived') {
      return this.props.archivedList;
    } else {
      return this.props.activeList.concat(
        this.props.bookmarkedList,
        this.props.archivedList
      );
    }
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
          desc: 'asc',
        },
        selectedColumn,
      }),
    });
  };

  showSpecialTopic = experiments.isEnabled(experiments.SPECIAL_TOPIC);

  getColumns = sortable => {
    const columns = [
      {
        property: 'thumbnailUrl',
        header: {
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.headerCellFirst,
              ...styles.headerCellThumbnail,
              ...tableLayoutStyles.unsortableHeader,
            },
          },
        },
        cell: {
          formatters: [thumbnailFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.cellFirst,
              ...styles.cellThumbnail,
            },
          },
        },
      },
      {
        property: 'projectName',
        header: {
          label: i18n.projectName(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.headerCellName,
            },
          },
        },
        cell: {
          formatters: [nameFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.cellName,
            },
          },
        },
      },
      {
        property: 'type',
        header: {
          label: i18n.projectType(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          formatters: [typeFormatter],
          props: {
            style: {
              ...styles.cellType,
              ...tableLayoutStyles.cell,
            },
          },
        },
      },
      {
        property: 'status',
        header: {
          label: 'Status',
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          formatters: [statusFormatter],
          props: {
            style: {
              ...styles.cellType,
              ...tableLayoutStyles.cell,
            },
          },
        },
      },
      {
        property: 'featuredAt',
        header: {
          label: i18n.featured(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          formatters: [dateFormatter],
          props: {style: tableLayoutStyles.cell},
        },
      },
      {
        property: 'unfeaturedAt',
        header: {
          label: i18n.unfeatured(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          formatters: [dateFormatter],
          props: {style: tableLayoutStyles.cell},
        },
      },
      {
        property: 'actions',
        header: {
          label: i18n.quickActions(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...tableLayoutStyles.unsortableHeader,
            },
          },
        },
        cell: {
          formatters: [actionsFormatter],
          props: {style: tableLayoutStyles.cell},
        },
      },
    ];
    if (this.showSpecialTopic) {
      columns.splice(4, 0, {
        property: 'topic',
        header: {
          label: 'Topic',
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          formatters: [topicFormatter],
          props: {
            style: {
              ...styles.cellType,
              ...tableLayoutStyles.cell,
            },
          },
        },
      });
    }
    return columns;
  };

  renderStatusFilterDropdown = () => {
    return (
      <SimpleDropdown
        name="featured-projects-table-filter-dropdown"
        items={[
          {value: 'all', text: 'all'},
          {value: 'active', text: 'currently featured'},
          {value: 'bookmarked', text: 'bookmarked'},
          {value: 'archived', text: 'archived'},
        ]}
        labelText="Featured projects table filter dropdown"
        isLabelVisible={false}
        selectedValue={this.state.filterDropdownStatusValue}
        onChange={e => {
          this.setFilterDropdownStatusValue(e.target.value);
          console.log('e.target.value', e.target.value);
        }}
        size="s"
      />
    );
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
      sort: orderBy,
    })(this.getProjectList());

    return (
      <div>
        {this.renderStatusFilterDropdown()}
        <Table.Provider columns={columns} style={tableLayoutStyles.table}>
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="channel" />
        </Table.Provider>
      </div>
    );
  }
}

export default FeaturedProjectsTable;
