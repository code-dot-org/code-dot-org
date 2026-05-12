import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';

import {nestedUnitUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import wrappedSortable from '../tables/wrapped_sortable';

import {textResponsePropType} from './textReponsesDataApi';

const TABLE_WIDTH = tableLayoutStyles.table.width;
const TABLE_COLUMN_WIDTHS = {
  name: TABLE_WIDTH / 5,
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
    courseVersionName: PropTypes.string,
    unitPosition: PropTypes.number,
  };

  state = {};

  studentNameFormatter = (name, {rowData}) => {
    const {sectionId, courseVersionName, unitPosition} = this.props;
    const studentUrl = nestedUnitUrlForStudent(
      sectionId,
      courseVersionName,
      unitPosition,
      rowData.studentId
    );

    if (studentUrl) {
      return (
        <Link
          className="uitest-name-cell"
          size="s"
          href={studentUrl}
          openInNewTab
        >
          {name}
        </Link>
      );
    } else {
      return <span className="uitest-name-cell">{name}</span>;
    }
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
        <Link href={url} size="s" openInNewTab>
          {i18n.seeFullResponse()}
        </Link>
      </div>
    );
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  getColumns = sortable => {
    return [
      {
        property: 'studentName',
        header: {
          label: i18n.name(),
          props: {
            className: 'uitest-name-header',
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
    ];
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

  render() {
    const {responses, isLoading} = this.props;

    if (isLoading) {
      return (
        <FontAwesomeV6Icon
          id="uitest-spinner"
          iconName="spinner"
          iconStyle="solid"
          animationType="spin-pulse"
          className="fa-3x"
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

export default TextResponsesTable;
