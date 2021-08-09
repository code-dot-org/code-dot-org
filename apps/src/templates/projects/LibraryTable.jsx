import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import _ from 'lodash';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import wrappedSortable from '../tables/wrapped_sortable';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import {unpublishProjectLibrary} from './projectsRedux';
import PersonalProjectsNameCell from './PersonalProjectsNameCell';
import Button from '@cdo/apps/templates/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {reload} from '@cdo/apps/utils';

export const COLUMNS = {
  LIBRARY_NAME: 0,
  PROJECT_NAME: 1,
  DESCRIPTION: 2,
  LAST_PUBLISHED: 3,
  ACTIONS: 4
};

const CELL_WIDTH = 250;

const projectNameFormatter = (name, {rowData}) => {
  return (
    <PersonalProjectsNameCell
      id={rowData.id}
      projectId={rowData.channel}
      projectType={rowData.type}
      projectName={name}
      isEditing={rowData.isEditing}
    />
  );
};

const descriptionFormatter = description => {
  return <div style={styles.truncateText}>{description}</div>;
};

const dateFormatter = time => {
  if (time) {
    const date = new Date(time);
    return date.toLocaleDateString();
  } else {
    return null;
  }
};

class LibraryTable extends React.Component {
  static propTypes = {
    // Provided by Redux
    personalProjectsList: PropTypes.array,
    unpublishProjectLibrary: PropTypes.func.isRequired
  };

  state = {
    sortingColumns: {
      [COLUMNS.LAST_PUBLISHED]: {
        direction: 'desc',
        position: 0
      }
    },
    unpublishFailedChannel: null
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

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
    return [
      {
        property: 'libraryName',
        header: {
          label: i18n.libraryName(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.headerCellName
            }
          },
          transforms: [sortable]
        },
        cell: {
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.cellName
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
          formatters: [projectNameFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.cellName
            }
          }
        }
      },
      {
        property: 'libraryDescription',
        header: {
          label: i18n.description(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.headerCellName
            }
          },
          transforms: [sortable]
        },
        cell: {
          formatters: [descriptionFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.cellName
            }
          }
        }
      },
      {
        property: 'libraryPublishedAt',
        header: {
          label: i18n.lastPublished(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.headerCellName
            }
          },
          transforms: [sortable]
        },
        cell: {
          formatters: [dateFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.cellName
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
              ...styles.cellName,
              ...styles.centeredCell
            }
          }
        }
      }
    ];
  };

  actionsFormatter = (_, {rowData}) => {
    return (
      <Button
        __useDeprecatedTag
        text={i18n.unpublish()}
        color={Button.ButtonColor.orange}
        onClick={() => {
          this.setState({unpublishFailedChannel: null});
          this.props.unpublishProjectLibrary(rowData.channel, error => {
            if (error) {
              this.setState({unpublishFailedChannel: rowData.channel});
            } else {
              reload();
            }
          });
        }}
      />
    );
  };

  render() {
    if (!this.props.personalProjectsList) {
      // Projects haven't loaded from server yet, so display nothing.
      return null;
    }

    const libraries = this.props.personalProjectsList.filter(
      project => project.libraryName
    );

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
      sort: _.orderBy
    })(libraries);

    const hasLibraries = libraries.length > 0;
    const unpublishFailedLibrary = libraries.find(
      library => library.channel === this.state.unpublishFailedChannel
    );

    return (
      <div className="ui-test-library-table">
        {hasLibraries && (
          <Table.Provider columns={columns} style={tableLayoutStyles.table}>
            <Table.Header />
            <Table.Body rows={sortedRows} rowKey="channel" />
          </Table.Provider>
        )}
        {!hasLibraries && (
          <h3 style={{textAlign: 'center'}}>{i18n.noLibraries()}</h3>
        )}
        {unpublishFailedLibrary && (
          <BaseDialog
            isOpen
            handleClose={() => this.setState({unpublishFailedChannel: null})}
            style={styles.dialog}
            useUpdatedStyles
          >
            <h1>{i18n.unpublishFailureTitle()}</h1>
            <p style={styles.dialogBody}>
              {i18n.unpublishFailureBody({
                libraryName: unpublishFailedLibrary.name
              })}
            </p>
          </BaseDialog>
        )}
      </div>
    );
  }
}

const styles = {
  headerCellName: {
    borderWidth: '0px 1px 1px 0px',
    borderColor: color.border_light_gray,
    padding: 15
  },
  cellName: {
    borderWidth: '1px 1px 1px 0px',
    borderColor: color.border_light_gray,
    padding: 15,
    width: CELL_WIDTH
  },
  truncateText: {
    width: CELL_WIDTH,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  centeredCell: {
    textAlign: 'center'
  },
  dialog: {
    padding: '0 15px 8px 15px'
  },
  dialogBody: {
    fontSize: 18,
    color: color.charcoal
  }
};

export const UnconnectedLibraryTable = LibraryTable;

export default connect(
  state => ({
    personalProjectsList: state.projects.personalProjectsList.projects
  }),
  dispatch => ({
    unpublishProjectLibrary(channelId, onComplete, libraryApi) {
      dispatch(unpublishProjectLibrary(channelId, onComplete, libraryApi));
    }
  })
)(LibraryTable);
