import {
  ActionDropdown,
  SimpleDropdown,
} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';
import React from 'react';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';

import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import {FeaturedProjectStatus} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {ImageWithStatus} from '../ImageWithStatus';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import wrappedSortable from '../tables/wrapped_sortable';

import {featuredProjectDataPropType} from './projectConstants';
import {FEATURED_PROJECT_TYPE_MAP} from './projectTypeMap';
import {getThumbnailUrl} from './projectUtils';

const THUMBNAIL_SIZE = 65;

/** @enum {number} */
export const COLUMNS = {
  THUMBNAIL: 0,
  PROJECT_NAME: 1,
  APP_TYPE: 2,
  STATUS: 3,
  LAST_FEATURED: 4,
  LAST_PUBLISHED: 5,
  ACTIONS: 6,
};

export const styles = {
  cellFirst: {
    borderWidth: '1px 0px 1px 1px',
    borderColor: 'var(--borders-neutral-primary)',
  },
  headerCellFirst: {
    borderWidth: '0px 0px 1px 0px',
    borderColor: 'var(--borders-neutral-primary)',
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
    borderColor: 'var(--borders-neutral-primary)',
    padding: 15,
    width: 250,
  },
  headerCellName: {
    borderWidth: '0px 1px 1px 0px',
    borderColor: 'var(--borders-neutral-primary)',
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
  tableMessage: {
    marginInlineStart: 10,
  },
};

// Cell formatters.
const thumbnailFormatter = function (thumbnailUrl, {rowData}) {
  const projectUrl = `/projects/${rowData.type}/${rowData.channel}/`;
  thumbnailUrl = getThumbnailUrl(thumbnailUrl, rowData.type);
  return (
    <Link href={projectUrl} openInNewTab>
      <ImageWithStatus
        src={thumbnailUrl}
        width={THUMBNAIL_SIZE}
        wrapperStyle={styles.thumbnailWrapper}
      />
    </Link>
  );
};

const nameFormatter = (projectName, {rowData}) => {
  const url = `/projects/${rowData.type}/${rowData.channel}/`;
  return (
    <Link href={url} openInNewTab size="s">
      {projectName}
    </Link>
  );
};

const unfeature = channel => {
  const url = `/featured_projects/${channel}/unfeature`;
  HttpClient.put(url, undefined, true)
    .then(handleSuccess)
    .catch(handleUnfeatureFailure);
};

const bookmark = channel => {
  const url = `/featured_projects/${channel}/bookmark`;
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
  const status = rowData.status;
  const options = [];
  if (status !== FeaturedProjectStatus.active) {
    options.push({
      value: `feature-${rowData.channel}`,
      label: 'Feature',
      icon: {iconName: 'star', iconStyle: 'solid'},
      onClick: () => feature(rowData.channel, rowData.publishedAt),
    });
  }
  if (status === FeaturedProjectStatus.active) {
    options.push({
      value: `unfeature-${rowData.channel}`,
      label: 'Unfeature',
      icon: {iconName: 'ban', iconStyle: 'solid'},
      onClick: () => unfeature(rowData.channel),
    });
  }
  if (status === FeaturedProjectStatus.archived) {
    options.push({
      value: `bookmark-${rowData.channel}`,
      label: 'Bookmark',
      icon: {iconName: 'bookmark', iconStyle: 'solid'},
      onClick: () => bookmark(rowData.channel),
    });
  }
  options.push({
    value: `remove-${rowData.channel}`,
    label: 'Remove',
    icon: {iconName: 'circle-xmark', iconStyle: 'solid'},
    isOptionDestructive: true,
    onClick: () => onDelete(rowData.channel),
  });

  return (
    <ActionDropdown
      name={`featured-actions-${rowData.channel}`}
      labelText={i18n.quickActions()}
      size="s"
      menuPlacement="right"
      options={options}
      triggerButtonProps={{
        variant: 'outlined',
        color: 'secondary',
        children: <FontAwesomeV6Icon iconName="ellipsis-vertical" />,
      }}
    />
  );
};

const dateFormatter = time => {
  if (time) {
    const date = new Date(time);
    return date.toLocaleDateString();
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

const publishedFormatter = time => {
  return time ? 'yes' : 'no';
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
    sortingColumns: {
      [COLUMNS.LAST_FEATURED]: {
        direction: 'desc',
        position: 4,
      },
    },
    filterDropdownStatusValue:
      tryGetLocalStorage('featured-projects-filter-dropdown', 'all') || 'all',
  };

  setFilterDropdownStatusValue = value => {
    trySetLocalStorage('featured-projects-filter-dropdown', value);
    this.setState({filterDropdownStatusValue: value});
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  getProjectList = () => {
    if (this.state.filterDropdownStatusValue === FeaturedProjectStatus.active) {
      return this.props.activeList;
    } else if (
      this.state.filterDropdownStatusValue === FeaturedProjectStatus.bookmarked
    ) {
      return this.props.bookmarkedList;
    } else if (
      this.state.filterDropdownStatusValue === FeaturedProjectStatus.archived
    ) {
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
        property: 'publishedAt',
        header: {
          label: i18n.submitted(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          formatters: [publishedFormatter],
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
          {value: FeaturedProjectStatus.active, text: 'currently featured'},
          {
            value: FeaturedProjectStatus.bookmarked,
            text: FeaturedProjectStatus.bookmarked,
          },
          {
            value: FeaturedProjectStatus.archived,
            text: FeaturedProjectStatus.archived,
          },
        ]}
        labelText="Featured projects table filter dropdown"
        isLabelVisible={false}
        selectedValue={this.state.filterDropdownStatusValue}
        onChange={e => {
          this.setFilterDropdownStatusValue(e.target.value);
        }}
        style={{marginBottom: 10}}
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

    const mustBeSubmittedMessage =
      '* Featured projects must be submitted (published) in order to be displayed in the public featured projects gallery.';

    return (
      <div>
        {this.renderStatusFilterDropdown()}
        <span style={styles.tableMessage}>{mustBeSubmittedMessage}</span>
        <Table.Provider columns={columns} style={tableLayoutStyles.table}>
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="channel" />
        </Table.Provider>
      </div>
    );
  }
}

export default FeaturedProjectsTable;
