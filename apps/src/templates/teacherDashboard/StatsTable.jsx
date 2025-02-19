import orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';

import {
  asyncLoadCoursesWithProgress,
  getSelectedUnitName,
} from '@cdo/apps/redux/unitSelectionRedux';
import {unitUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

import {tableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import wrappedSortable from '../tables/wrapped_sortable';

const familyNameFormatter = familyName => {
  return <span className="uitest-family-name-cell">{familyName}</span>;
};

const familyNameColumn = sortable => {
  return {
    property: 'familyName',
    header: {
      label: i18n.familyName(),
      props: {
        className: 'uitest-family-name-header',
        style: {
          ...tableLayoutStyles.headerCell,
        },
      },
      transforms: [sortable],
    },
    cell: {
      formatters: [familyNameFormatter],
      props: {
        style: {
          ...tableLayoutStyles.cell,
        },
      },
    },
  };
};

const completedLevelsCountColumn = sortable => {
  return {
    property: 'completedLevelsCount',
    header: {
      label: i18n.completedLevels(),
      props: {
        style: {
          ...tableLayoutStyles.headerCell,
          ...styles.rightAlignText,
        },
      },
      transforms: [sortable],
    },
    cell: {
      props: {
        style: {
          ...tableLayoutStyles.cell,
          ...styles.rightAlignText,
        },
      },
    },
  };
};

const nameFormatter = (name, {rowData}, _rowInd, extraData) => {
  if (extraData === undefined) {
    return <span className="uitest-display-name-cell">{name}</span>;
  }
  const {scriptName, sectionId} = extraData;
  const studentUrl = unitUrlForStudent(sectionId, scriptName, rowData.id);

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

function StatsTable({
  sectionId,
  students,
  studentsCompletedLevelCount,
  scriptName,
  participantType,
  asyncLoadCoursesWithProgress,
}) {
  React.useEffect(() => {
    // Load courses to enable student links to course page
    asyncLoadCoursesWithProgress();
  }, [asyncLoadCoursesWithProgress]);

  const [sortingColumns, setSortingColumns] = React.useState(undefined);

  const studentsWithCompletedLevelCount = React.useCallback(() => {
    return (students || []).map(student => ({
      ...student,
      completedLevelsCount: studentsCompletedLevelCount[student.id] || 0,
    }));
  }, [students, studentsCompletedLevelCount]);

  const getSortingColumns = React.useCallback(() => {
    return sortingColumns || {};
  }, [sortingColumns]);

  const getColumns = React.useCallback(
    sortable => {
      const columns = [nameColumn(sortable)];

      // Only include family name in non-PL sections
      if (participantType === 'student') {
        columns.push(familyNameColumn(sortable));
      }

      columns.push(completedLevelsCountColumn(sortable));

      return columns;
    },
    [nameColumn, participantType]
  );

  React.useEffect(() => {
    console.log('lfm0', scriptName, sectionId, {scriptName, sectionId});
  }, [scriptName, sectionId]);

  const nameColumn = React.useCallback(
    sortable => {
      console.log('lfm1', scriptName, sectionId, {scriptName, sectionId});
      return {
        property: 'name',
        header: {
          label: i18n.name(),
          props: {
            className: 'uitest-display-name-header',
            style: {
              ...tableLayoutStyles.headerCell,
            },
          },
          transforms: [sortable],
        },
        cell: {
          formatters: [nameFormatter],
          formatExtraData: {scriptName, sectionId},
          props: {
            style: {
              ...tableLayoutStyles.cell,
            },
          },
        },
      };
    },
    [scriptName, sectionId]
  );

  // The user requested a new sorting column. Adjust the state accordingly.
  const onSort = React.useCallback(
    selectedColumn => {
      setSortingColumns(
        sort.byColumn({
          sortingColumns: sortingColumns,
          // Custom sortingOrder removes 'no-sort' from the cycle
          sortingOrder: {
            FIRST: 'asc',
            asc: 'desc',
            desc: 'asc',
          },
          selectedColumn,
        })
      );
    },
    [sortingColumns]
  );

  const columns = React.useMemo(() => {
    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(
      getSortingColumns,
      onSort,
      sortableOptions
    );
    return getColumns(sortable);
  }, [getColumns, getSortingColumns, onSort]);

  const sortedRows = React.useMemo(
    () =>
      sort.sorter({
        columns,
        sortingColumns,
        sort: orderBy,
      })(studentsWithCompletedLevelCount()),
    [columns, sortingColumns, studentsWithCompletedLevelCount]
  );

  return (
    <Table.Provider
      columns={columns}
      style={styles.table}
      id="uitest-stats-table"
    >
      <Table.Header />
      <Table.Body rows={sortedRows} rowKey="id" />
    </Table.Provider>
  );
}

StatsTable.propTypes = {
  sectionId: PropTypes.number.isRequired,
  students: PropTypes.array.isRequired,
  studentsCompletedLevelCount: PropTypes.object,

  // Provided by redux.
  scriptName: PropTypes.string,
  participantType: PropTypes.string,
  asyncLoadCoursesWithProgress: PropTypes.func.isRequired,
};

const styles = {
  table: {
    width: '100%',
  },
  rightAlignText: {
    textAlign: 'right',
  },
};

export const UnconnectedStatsTable = StatsTable;
export default connect(
  state => ({
    scriptName: getSelectedUnitName(state),
    participantType:
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
        .participantType,
  }),
  dispatch => ({
    asyncLoadCoursesWithProgress() {
      dispatch(asyncLoadCoursesWithProgress());
    },
  })
)(StatsTable);
