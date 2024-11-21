import {orderBy} from 'lodash';
import React from 'react';
import * as Table from 'reactabular-table';
// @ts-expect-error sortabular doesn't define it's types.
import * as sort from 'sortabular';

import Link from '@cdo/apps/componentLibrary/link';
import Typography from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  sortableOptions,
  tableLayoutStyles,
} from '@cdo/apps/templates/tables/tableConstants';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

interface RowData {
  section: Section;
}

interface Props {
  ageGatedSections: Section[];
}

export const AgeGatedSectionsTable: React.FC<Props> = ({ageGatedSections}) => {
  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload);
  };
  const getColumns = () => {
    return [sectionColumn(), gradesColumn()];
  };

  const initialSortingColumns = {
    0: {
      direction: 'asc',
      position: 0,
    },
  };
  const [sortingColumns, setSortingColumns] = React.useState(
    initialSortingColumns
  );
  const onSort = (selectedColumn: number) => {
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
  };
  const sortable = wrappedSortable(
    () => sortingColumns,
    onSort,
    sortableOptions
  );
  const sectionFormatter = (name: string, {rowData}: {rowData: RowData}) => (
    <Typography semanticTag="p" visualAppearance="body-two">
      <Link
        href={teacherDashboardUrl(rowData.section.id)}
        onClick={() => {
          reportEvent(
            EVENTS.CAP_AGE_GATED_SECTIONS_TABLE_SECTION_NAME_LINK_CLICKED,
            {
              section_id: rowData.section.id,
              us_state: rowData.section.atRiskAgeGatedUsState,
            }
          );
        }}
        openInNewTab={true}
      >
        {name}
      </Link>
    </Typography>
  );

  const sectionColumn = () => {
    return {
      property: 'name',
      header: {
        label: i18n.childAccountPolicy_ageGatedSectionsTable_sectionHeader(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
          },
        },
        transforms: [sortable],
      },
      cell: {
        formatters: [sectionFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
          },
        },
      },
    };
  };
  const gradesFormatter = (grades: string[]) => (
    <Typography semanticTag="p" visualAppearance="body-two">
      {grades && grades.join(', ')}
    </Typography>
  );

  const gradesColumn = () => {
    return {
      property: 'grades',
      header: {
        label: i18n.childAccountPolicy_ageGatedSectionsTable_gradesHeader(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
          },
        },
      },
      cell: {
        formatters: [gradesFormatter],
        props: {
          style: {
            ...tableLayoutStyles.cell,
          },
        },
      },
    };
  };

  const columns = getColumns();
  const sectionData: RowData[] = ageGatedSections.map(section => {
    return {
      id: section.id,
      section: section,
      grades: section.grades,
      name: section.name,
    };
  });
  const sortedData = sort.sorter({
    columns,
    sortingColumns,
    sort: orderBy,
  })(sectionData);
  return (
    <div>
      {sortedData && sortedData.length !== 0 && (
        <Table.Provider
          columns={columns}
          style={tableLayoutStyles.table}
          // eslint-disable-next-line react/forbid-component-props
          data-testid="uitest-age-gated-sections-table"
        >
          <Table.Header />
          <Table.Body rows={sortedData} rowKey="id" />
        </Table.Provider>
      )}
    </div>
  );
};
