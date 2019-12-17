import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import {tableLayoutStyles} from '@cdo/apps/templates/tables/tableConstants';
import i18n from '@cdo/locale';
import StandardDescriptionCell from './StandardDescriptionCell';
import {connect} from 'react-redux';
import {
  getLessonsCompletedByStandardForScript,
  getStandardsCoveredForScript
} from './sectionStandardsProgressRedux';

export const COLUMNS = {
  STANDARD_CATEGORY: 0,
  STANDARD_NUMBER: 1,
  STANDARD_DESCRIPTION: 2,
  LESSONS_COMPLETED: 3
};

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
    maxWidth: 470
  }
};

class StandardsProgressTable extends Component {
  static propTypes = {
    standards: PropTypes.array,
    lessonsCompletedByStandard: PropTypes.object
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
      />
    );
  };

  getColumns = () => {
    let dataColumns = [
      {
        property: 'category',
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
        property: 'number',
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

  getNumCompleted = (standard, index) => {
    let count = 0;
    if (this.props.lessonsCompletedByStandard[index + 1]) {
      this.props.lessonsCompletedByStandard[index + 1].lessons.forEach(
        lesson => {
          if (lesson.completed) {
            count++;
          }
        }
      );
    }
    return count;
  };

  render() {
    const columns = this.getColumns();

    const rowData = this.props.standards.map((standard, index) => {
      return {
        ...standard,
        numCompleted: this.getNumCompleted(standard, index),
        lessonsForStandardStatus: this.props.lessonsCompletedByStandard[
          index + 1
        ]
          ? this.props.lessonsCompletedByStandard[index + 1].lessons
          : []
      };
    });

    return (
      <Table.Provider columns={columns} style={tableLayoutStyles.table}>
        <Table.Header />
        <Table.Body rows={rowData} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default connect(state => ({
  standards: getStandardsCoveredForScript(),
  lessonsCompletedByStandard: getLessonsCompletedByStandardForScript()
}))(StandardsProgressTable);
