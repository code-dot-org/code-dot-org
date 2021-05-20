import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import {tableLayoutStyles} from '@cdo/apps/templates/tables/tableConstants';
import i18n from '@cdo/locale';
import StandardDescriptionCell from './StandardDescriptionCell';
import {connect} from 'react-redux';
import {lessonsByStandard} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import _ from 'lodash';

export const COLUMNS = {
  STANDARD_CATEGORY: 0,
  STANDARD_NUMBER: 1,
  STANDARD_DESCRIPTION: 2,
  LESSONS_COMPLETED: 3
};

class StandardsProgressTable extends Component {
  static propTypes = {
    style: PropTypes.object,
    isViewingReport: PropTypes.bool,
    //redux
    standards: PropTypes.array,
    lessonsByStandard: PropTypes.object
  };

  standardCategoryCellFormatter = (standard, {rowData, rowIndex}) => {
    return <div>{standard}</div>;
  };

  standardNumberCellFormatter = (standard, {rowData, rowIndex}) => {
    return <div>{standard}</div>;
  };

  lessonsCompletedColumnFormatter = (lesson, {rowData, columnIndex}) => {
    return <div id={rowData.id}>{rowData.numCompleted}</div>;
  };

  standardDescriptionColumnFormatter = (standard, {rowData, rowIndex}) => {
    return (
      <StandardDescriptionCell
        id={rowData.id}
        description={rowData.description}
        lessonsForStandardStatus={rowData.lessonsForStandardStatus}
        isViewingReport={this.props.isViewingReport}
      />
    );
  };

  getColumns = () => {
    let dataColumns = [
      {
        property: 'category_description',
        header: {
          label: i18n.standardConcept(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.mainColumnHeader
            }
          }
        },
        cell: {
          formatters: [this.standardCategoryCellFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.mainColumnCell
            }
          }
        }
      },
      {
        property: 'shortcode',
        header: {
          label: i18n.standardIdentifier(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.mainColumnHeader
            }
          }
        },
        cell: {
          formatters: [this.standardNumberCellFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.mainColumnCell
            }
          }
        }
      },
      {
        property: 'description',
        header: {
          label: i18n.description(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.descriptionColumnHeader
            }
          }
        },
        cell: {
          formatters: [this.standardDescriptionColumnFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.descriptionCell
            }
          }
        }
      },
      {
        property: 'numCompleted',
        header: {
          label: i18n.lessonsCompleted(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell,
              ...styles.mainColumnHeader
            }
          }
        },
        cell: {
          formatters: [this.lessonsCompletedColumnFormatter],
          props: {
            style: {
              ...tableLayoutStyles.cell,
              ...styles.mainColumnCell
            }
          }
        }
      }
    ];
    return dataColumns;
  };

  getNumLessonsCompletedForStandard = (standard, index) => {
    let count = 0;
    if (this.props.lessonsByStandard[standard.id]) {
      this.props.lessonsByStandard[standard.id].forEach(lesson => {
        if (lesson.completed) {
          count++;
        }
      });
    }
    return count;
  };

  render() {
    const loading = _.isEmpty(this.props.lessonsByStandard);
    const columns = this.getColumns();
    const standards = this.props.standards || [];
    const rowData = standards.map((standard, index) => {
      return {
        ...standard,
        numCompleted: this.getNumLessonsCompletedForStandard(standard, index),
        lessonsForStandardStatus: this.props.lessonsByStandard[standard.id]
          ? this.props.lessonsByStandard[standard.id]
          : []
      };
    });

    return (
      <div>
        {loading && (
          <FontAwesome
            id="uitest-spinner"
            icon="spinner"
            className="fa-pulse fa-3x"
          />
        )}
        {!loading && (
          <Table.Provider
            columns={columns}
            style={{...tableLayoutStyles.table, ...this.props.style}}
            id="uitest-progress-standards-table"
          >
            <Table.Header />
            <Table.Body rows={rowData} rowKey="id" />
          </Table.Provider>
        )}
      </div>
    );
  }
}

const styles = {
  mainColumnHeader: {
    width: 80,
    textAlign: 'center'
  },
  descriptionColumnHeader: {
    textAlign: 'center'
  },
  mainColumnCell: {
    width: 80,
    textAlign: 'center'
  },
  descriptionCell: {
    maxWidth: 470,
    padding: '10px 10px 0px 10px'
  }
};

export const UnconnectedStandardsProgressTable = StandardsProgressTable;

export default connect(state => ({
  lessonsByStandard: lessonsByStandard(state),
  standards: state.sectionStandardsProgress.standardsData
}))(StandardsProgressTable);
