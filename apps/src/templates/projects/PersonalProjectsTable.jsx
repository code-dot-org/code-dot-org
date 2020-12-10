import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import color from '../../util/color';
import {ImageWithStatus} from '../ImageWithStatus';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import {personalProjectDataPropType} from './projectConstants';
import {PROJECT_TYPE_MAP} from './projectTypeMap';
import {
  AlwaysPublishableProjectTypes,
  ConditionallyPublishableProjectTypes
} from '@cdo/apps/util/sharedConstants';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import PersonalProjectsTableActionsCell from './PersonalProjectsTableActionsCell';
import PersonalProjectsNameCell from './PersonalProjectsNameCell';
import PersonalProjectsPublishedCell from './PersonalProjectsPublishedCell';
import PublishDialog from '@cdo/apps/templates/projects/publishDialog/PublishDialog';
import DeleteProjectDialog from '@cdo/apps/templates/projects/deleteDialog/DeleteProjectDialog';

const PROJECT_DEFAULT_IMAGE = '/blockly/media/projects/project_default.png';

const THUMBNAIL_SIZE = 65;

/** @enum {number} */
export const COLUMNS = {
  THUMBNAIL: 0,
  PROJECT_NAME: 1,
  APP_TYPE: 2,
  LAST_EDITED: 3,
  LAST_PUBLISHED: 4,
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
  centeredCell: {
    textAlign: 'center'
  },
  thumbnailWrapper: {
    height: THUMBNAIL_SIZE,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomMargin: {
    marginBottom: 20
  }
};

// Cell formatters.
const thumbnailFormatter = function(thumbnailUrl, {rowData}) {
  const projectUrl = `/projects/${rowData.type}/${rowData.channel}/edit`;
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
  const updatedName = rowData.isEditing ? rowData.updatedName : '';
  return (
    <PersonalProjectsNameCell
      id={rowData.id}
      projectId={rowData.channel}
      projectType={rowData.type}
      projectName={projectName}
      isEditing={rowData.isEditing}
      updatedName={updatedName}
    />
  );
};

const typeFormatter = type => {
  return PROJECT_TYPE_MAP[type];
};

const dateFormatter = function(time) {
  const date = new Date(time);
  return date.toLocaleDateString();
};

class PersonalProjectsTable extends React.Component {
  static propTypes = {
    canShare: PropTypes.bool.isRequired,

    // Provided by Redux
    personalProjectsList: PropTypes.arrayOf(personalProjectDataPropType)
  };

  state = {
    sortingColumns: {
      [COLUMNS.LAST_EDITED]: {
        direction: 'desc',
        position: 0
      }
    }
  };

  publishedAtFormatter = (publishedAt, {rowData}) => {
    const {canShare} = this.props;
    const isPublishable =
      AlwaysPublishableProjectTypes.includes(rowData.type) ||
      (ConditionallyPublishableProjectTypes.includes(rowData.type) && canShare);

    return (
      <PersonalProjectsPublishedCell
        isPublishable={isPublishable}
        isPublished={!!rowData.publishedAt}
        projectId={rowData.channel}
        projectType={rowData.type}
      />
    );
  };

  actionsFormatter = (actions, {rowData}) => {
    return (
      <PersonalProjectsTableActionsCell
        projectId={rowData.channel}
        projectType={rowData.type}
        isEditing={rowData.isEditing}
        updatedName={rowData.updatedName}
        projectNameFailure={rowData.projectNameFailure}
      />
    );
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
        property: 'name',
        header: {
          label: i18n.projectName(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.headerCellName
            }
          },
          transforms: [sortable]
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
        property: 'updatedAt',
        header: {
          label: i18n.lastEdited(),
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable]
        },
        cell: {
          formatters: [dateFormatter],
          props: {style: tableLayoutStyles.cell}
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
          formatters: [this.publishedAtFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.centeredCell
            }
          }
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
          formatters: [this.actionsFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.centeredCell
            }
          }
        }
      }
    ];
    return dataColumns;
  };

  render() {
    if (!this.props.personalProjectsList) {
      return null;
    }

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
    })(this.props.personalProjectsList);

    const noProjects = this.props.personalProjectsList.length === 0;

    return (
      <div>
        <div id="uitest-personal-projects" style={styles.bottomMargin}>
          {!noProjects && (
            <Table.Provider
              columns={columns}
              style={tableLayoutStyles.table}
              className="ui-personal-projects-table"
            >
              <Table.Header />
              <Table.Body
                rows={sortedRows}
                rowKey="channel"
                className="ui-personal-projects-row"
              />
            </Table.Provider>
          )}
          {noProjects && (
            <h3 style={{textAlign: 'center'}}>{i18n.noPersonalProjects()}</h3>
          )}
        </div>
        <PublishDialog />
        <DeleteProjectDialog />
      </div>
    );
  }
}

export const UnconnectedPersonalProjectsTable = PersonalProjectsTable;

export default connect(state => ({
  personalProjectsList: state.projects.personalProjectsList.projects
}))(PersonalProjectsTable);
