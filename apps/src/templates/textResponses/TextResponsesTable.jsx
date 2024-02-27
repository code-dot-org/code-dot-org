import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import DCDO from '@cdo/apps/dcdo';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import wrappedSortable from '../tables/wrapped_sortable';
import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import orderBy from 'lodash/orderBy';
import {textResponsePropType} from './textReponsesDataApi';
import {scriptUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';

const TABLE_WIDTH = tableLayoutStyles.table.width;
const TABLE_COLUMN_WIDTHS = {
  name: TABLE_WIDTH / 5,
  familyName: TABLE_WIDTH / 5,
  lesson: TABLE_WIDTH / 5,
  puzzle: TABLE_WIDTH / 6,
  question: TABLE_WIDTH / 5,
  response: TABLE_WIDTH / 4,
};
const RESPONSE_CHARACTER_LIMIT = 100;

class TextResponsesTable extends Component {
  static propTypes = {
    responses: PropTypes.arrayOf(textResponsePropType),
    sectionId: PropTypes.number.isRequired,
    isLoading: PropTypes.bool,
    scriptName: PropTypes.string,
    participantType: PropTypes.string,
  };

  state = {};

  studentNameFormatter = (name, {rowData}) => {
    const {sectionId, scriptName} = this.props;
    const studentUrl = scriptUrlForStudent(
      sectionId,
      scriptName,
      rowData.studentId
    );

    if (studentUrl) {
      return (
        <a
          className="uitest-display-name-cell"
          style={tableLayoutStyles.link}
          href={studentUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </a>
      );
    } else {
      return <span className="uitest-display-name-cell">{name}</span>;
    }
  };

  familyNameFormatter = familyName => {
    return <span className="uitest-family-name-cell">{familyName}</span>;
  };

  responseFormatter = (_, {rowData}) => {
    const {response, url} = rowData;
    if (response.length < RESPONSE_CHARACTER_LIMIT) {
      return response;
    }

    const clippedResponse = response.substring(0, RESPONSE_CHARACTER_LIMIT - 1);
    return (
      <div>
        {clippedResponse}
        <a
          style={tableLayoutStyles.link}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n.seeFullResponse()}
        </a>
      </div>
    );
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  getColumns = sortable => {
    const columns = [this.nameColumn(sortable)];

    if (!!DCDO.get('family-name-features-p3', false)) {
      if (this.props.participantType === 'student') {
        columns.push(this.familyNameColumn(sortable));
      }
    }

    columns.push(
      this.lessonColumn(sortable),
      this.puzzleColumn(sortable),
      this.questionColumn(sortable),
      this.responseColumn(sortable)
    );
    return columns;
  };

  nameColumn(sortable) {
    return {
      property: 'studentName',
      header: {
        label: i18n.displayName(),
        props: {
          className: 'uitest-display-name-header',
          style: {
            ...tableLayoutStyles.headerCell,
            ...{width: TABLE_COLUMN_WIDTHS.name},
          },
        },
        transforms: [sortable],
      },
      cell: {
        formatters: [this.studentNameFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
          },
        },
      },
    };
  }

  familyNameColumn(sortable) {
    return {
      property: 'studentFamilyName',
      header: {
        label: i18n.familyName(),
        props: {
          className: 'uitest-family-name-header',
          style: {
            ...tableLayoutStyles.headerCell,
            ...{width: TABLE_COLUMN_WIDTHS.familyName},
          },
        },
        transforms: [sortable],
      },
      cell: {
        formatters: [this.familyNameFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
          },
        },
      },
    };
  }

  lessonColumn(sortable) {
    return {
      property: 'lesson',
      header: {
        label: i18n.lesson(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...{width: TABLE_COLUMN_WIDTHS.lesson},
          },
        },
        transforms: [sortable],
      },
      cell: {
        props: {
          style: {
            ...tableLayoutStyles.cell,
          },
        },
      },
    };
  }

  puzzleColumn(sortable) {
    return {
      property: 'puzzle',
      header: {
        label: i18n.puzzle(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...{width: TABLE_COLUMN_WIDTHS.puzzle},
          },
        },
        transforms: [sortable],
      },
      cell: {
        props: {
          style: {
            ...tableLayoutStyles.cell,
          },
        },
      },
    };
  }

  questionColumn(sortable) {
    return {
      property: 'question',
      header: {
        label: i18n.question(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...{width: TABLE_COLUMN_WIDTHS.question},
          },
        },
        transforms: [sortable],
      },
      cell: {
        props: {
          style: {
            ...tableLayoutStyles.cell,
          },
        },
      },
    };
  }

  responseColumn(sortable) {
    return {
      property: 'response',
      header: {
        label: i18n.response(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...{width: TABLE_COLUMN_WIDTHS.response},
          },
        },
      },
      cell: {
        formatters: [this.responseFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
          },
        },
      },
    };
  }

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

  render() {
    const {responses, isLoading} = this.props;

    if (isLoading) {
      return (
        <FontAwesome
          id="uitest-spinner"
          icon="spinner"
          className="fa-pulse fa-3x"
        />
      );
    }

    if (!responses || !responses.length) {
      return (
        <div id="uitest-empty-responses">{i18n.emptyTextResponsesTable()}</div>
      );
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
      sort: orderBy,
    })(responses);

    /**
     * Note: using rowIndex as rowKey as a last resort
     * See more info: https://reactjs.org/docs/lists-and-keys.html#keys
     * If this causes performance issues in the future, we can use something like:
     * `${rowData.studentId}-${rowData.puzzle}-${hashedResponse}`
     * where hashedResponse is a hash of rowData.response
     */
    return (
      <Table.Provider columns={columns} id="text-responses-table">
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey={({rowIndex}) => rowIndex} />
      </Table.Provider>
    );
  }
}

export const UnconnectedTextResponsesTable = TextResponsesTable;
export default connect(state => ({
  participantType:
    state.teacherSections.sections[state.teacherSections.selectedSectionId]
      .participantType,
}))(TextResponsesTable);
