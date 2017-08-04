import React, {PropTypes} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import _ from 'lodash';
import i18n from "@cdo/locale";
import color from "../../util/color";
import {ImageWithStatus} from '../ImageWithStatus';
import {Table} from 'reactabular';

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

/**
 * Map from project type to friendly name.
 * @type {Object}
 */
const PROJECT_TYPE_MAP = {
  algebra_game: i18n.projectTypeAlgebra(),
  applab: i18n.projectTypeApplab(),
  artist: i18n.projectTypeArtist(),
  gamelab: i18n.projectTypeGamelab(),
  playlab: i18n.projectTypePlaylab(),
  weblab: i18n.projectTypeWeblab(),
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
    width: 300
  },
  headerCellName: {
    borderWidth: '1px 1px 1px 0px',
    borderColor: color.border_light_gray,
    padding: 15
  },
  cellType: {
    width: 160
  },
  cellIsPublished: {
    textAlign: 'center'
  },
  cellAction: {
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

const PersonalProjectsTable = React.createClass({
  propTypes: {
    projectList: PropTypes.array.isRequired
  },

  thumbnailFormatter(thumbnailUrl) {
    thumbnailUrl = thumbnailUrl || PROJECT_DEFAULT_IMAGE;
    return (<ImageWithStatus
      src={thumbnailUrl}
      width={THUMBNAIL_SIZE}
      wrapperStyle={styles.thumbnailWrapper}
            />);
  },

  nameFormatter(name, {rowData}) {
    const url = '/projects/${rowData.type}/${rowData.channel}/';
    return <a style={styles.link} href={url} target="_blank">{name}</a>;
  },

  isPublishedFormatter(isPublished, {rowData}) {
    return isPublished ? (<FontAwesome icon="circle"/>) : '';
  },

  actionsFormatter() {
    return (<FontAwesome icon="angle-down"/>);
  },

  dateFormatter(time, {rowData}) {
    const date = new Date(time);
    return date.toLocaleDateString();
  },

  typeFormatter(type) {
    return PROJECT_TYPE_MAP[type];
  },

  getColumns() {
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
          format: this.thumbnailFormatter,
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
          format: this.nameFormatter,
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
        },
        cell: {
          format: this.typeFormatter,
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
        },
        cell: {
          format: this.dateFormatter,
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
          format: this.isPublishedFormatter,
          props: {style: {
            ...styles.cell,
            ...styles.cellIsPublished
          }}
        }
      },
      {
        property: 'actions',
        header: {
          label: i18n.catActions(),
          props: {style: styles.headerCell},
        },
        cell: {
          format: this.actionsFormatter,
          props: {style: {
            ...styles.cell,
            ...styles.cellAction
          }}
        }
      }
    ];
  },

  render() {
    return (
      <Table.Provider
        columns={this.getColumns()}
        style={styles.table}
      >
        <Table.Header />

        <Table.Body rows={convertChannelsToProjectData(this.props.projectList)} rowKey="channel" />
      </Table.Provider>
    );
  }
});

// The project widget uses the channels API to populate the personal projects
// and the data needs to be converted to match the format of the project cards
// before passing it to PersonalRecentProjects.
const convertChannelsToProjectData = function (projects) {
  // Sort by most recently updated.
  let projectLists = _.sortBy(projects, 'updatedAt').reverse();

  // Get the ones that aren't hidden, and have a type and id.
  projectLists = projectLists.filter(project => !project.hidden && project.id && project.projectType);
  const numProjects = Math.min(4, projectLists.length);
  return _.range(numProjects).map(i => (
    {
      name: projectLists[i].name,
      channel: projectLists[i].id,
      thumbnailUrl: projectLists[i].thumbnailUrl,
      type: projectLists[i].projectType,
      isPublished: projectLists[i].publishedAt !== null,
      updatedAt: projectLists[i].updatedAt
    }
  ));
};

export default PersonalProjectsTable;
