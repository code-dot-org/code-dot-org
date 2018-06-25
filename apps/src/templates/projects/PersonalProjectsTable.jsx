import React, {PropTypes} from 'react';
import i18n from "@cdo/locale";
import color from "../../util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {ImageWithStatus} from '../ImageWithStatus';
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import orderBy from 'lodash/orderBy';
import {
  personalProjectDataPropType,
  PROJECT_TYPE_MAP
} from './projectConstants';
import QuickActionsCell from '../tables/QuickActionsCell';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";

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
  centeredCell: {
    textAlign: 'center'
  },
  thumbnailWrapper: {
    height: THUMBNAIL_SIZE,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xIcon: {
    paddingRight: 5,
  },
};

// Cell formatters.
const thumbnailFormatter = function (thumbnailUrl, {rowData}) {
  const projectUrl = `/projects/${rowData.type}/${rowData.channel}/`;
  thumbnailUrl = thumbnailUrl || PROJECT_DEFAULT_IMAGE;
  return (
    <a style={tableLayoutStyles.link} href={projectUrl} target="_blank">
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
  return <a style={tableLayoutStyles.link} href={url} target="_blank">{projectName}</a>;
};

const actionsFormatter = (actions, {rowData}) => {
  return (
    <QuickActionsCell>
      <PopUpMenu.Item
        onClick={() => console.log("Rename was clicked")}
      >
        {i18n.rename()}
      </PopUpMenu.Item>
      <PopUpMenu.Item
        onClick={() => console.log("Remix was clicked")}
      >
        {i18n.remix()}
      </PopUpMenu.Item>
      {!!rowData.isPublished && (
        <PopUpMenu.Item
          onClick={() => console.log("Unpublish was clicked")}
        >
          {i18n.unpublish()}
        </PopUpMenu.Item>
      )}
      {!rowData.isPublished && (
        <PopUpMenu.Item
          onClick={() => console.log("Publish was clicked")}
        >
          {i18n.publish()}
        </PopUpMenu.Item>
      )}
      <MenuBreak/>
      <PopUpMenu.Item
        onClick={() => console.log("Delete was clicked")}
        color={color.red}
      >
        <FontAwesome icon="times-circle" style={styles.xIcon}/>
        {i18n.delete()}
      </PopUpMenu.Item>
    </QuickActionsCell>
  );
};

const typeFormatter = (type) => {
  return PROJECT_TYPE_MAP[type];
};

const dateFormatter = function (time) {
  const date = new Date(time);
  return date.toLocaleDateString();
};

const isPublishedFormatter = (isPublished) => {
  return isPublished ? (<FontAwesome icon="circle"/>) : '';
};

class PersonalProjectsTable extends React.Component {
  static propTypes = {
    projectList: PropTypes.arrayOf(personalProjectDataPropType).isRequired
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
        property: 'updatedAt',
        header: {
          label: "Last edited",
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: dateFormatter,
          props: {style: tableLayoutStyles.cell}
        }
      },
      {
        property: 'isPublished',
        header: {
          label: "Published",
          props: {style: tableLayoutStyles.headerCell},
          transforms: [sortable],
        },
        cell: {
          format: isPublishedFormatter,
          props: {style: {
            ...tableLayoutStyles.cell,
            ...styles.centeredCell
          }}
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
          format: actionsFormatter,
          props: {style: {
            ...tableLayoutStyles.cell,
            ...styles.centeredCell
          }}
        }
      }
    ];
    return dataColumns;
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
        <Table.Body rows={sortedRows} rowKey="channel" />
      </Table.Provider>
    );
  }
}

export default PersonalProjectsTable;
