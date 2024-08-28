import {orderBy, random} from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';

import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {stringifyQueryParams} from '../../utils';
import {plTableLayoutStyles, sortableOptions} from '../tables/tableConstants';
import wrappedSortable from '../tables/wrapped_sortable';

import SectionActionDropdown from './SectionActionDropdown';
import {sortableSectionShape} from './shapes';
import {getSectionRows} from './teacherSectionsRedux';

import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';

/** @enum {number} */
export const COLUMNS = {
  ID: 0,
  SECTION_NAME: 1,
  GRADE: 2,
  COURSE: 3,
  STUDENTS: 4,
  LOGIN_INFO: 5,
  EDIT_DELETE: 6,
};

const participantNames = {
  facilitator: i18n.participantTypeFacilitatorTitle(),
  teacher: i18n.participantTypeTeacherTitle(),
};

// Cell formatters for sortable OwnedPlSectionsTable.
export const sectionLinkFormatter = function (name, {rowData}) {
  return (
    <a style={plTableLayoutStyles.link} href={teacherDashboardUrl(rowData.id)}>
      {rowData.name}
    </a>
  );
};

export const courseLinkFormatter = function (course, {rowData}) {
  const {assignmentNames, assignmentPaths, courseOfferingsAreLoaded} = rowData;
  return (
    <div>
      {courseOfferingsAreLoaded ? (
        <>
          <a
            href={`${assignmentPaths[0]}${stringifyQueryParams({
              section_id: rowData.id,
            })}`}
            style={plTableLayoutStyles.link}
          >
            {assignmentNames[0]}
          </a>
          {assignmentPaths.length > 1 && (
            <div style={plTableLayoutStyles.currentUnit}>
              <div>{i18n.currentUnit()}</div>
              <a
                href={`${assignmentPaths[1]}${stringifyQueryParams({
                  section_id: rowData.id,
                })}`}
                style={plTableLayoutStyles.link}
              >
                {assignmentNames[1]}
              </a>
            </div>
          )}
          {assignmentPaths.length < 1 && (
            <Button
              __useDeprecatedTag
              text={i18n.coursesCardAction()}
              href={'/catalog'}
              color={Button.ButtonColor.neutralDark}
            />
          )}
        </>
      ) : (
        <span
          className={skeletonizeContent.skeletonizeContent}
          style={{width: random(30, 90) + '%'}}
        />
      )}
    </div>
  );
};

export const loginInfoFormatter = function (loginType, {rowData}) {
  let sectionCode = '';

  // For managed logins, just show the provider name rather than the login code.
  if (rowData.loginType === OAuthSectionTypes.clever) {
    sectionCode = i18n.loginTypeClever();
  } else if (rowData.loginType === OAuthSectionTypes.google_classroom) {
    sectionCode = i18n.loginTypeGoogleClassroom();
  } else if (rowData.loginType === SectionLoginType.lti_v1) {
    sectionCode = rowData.loginTypeName;
  } else {
    sectionCode = rowData.code;
  }
  return (
    <a
      style={plTableLayoutStyles.sectionCodeLink}
      href={teacherDashboardUrl(rowData.id, '/login_info')}
    >
      {sectionCode}
    </a>
  );
};

export const studentsFormatter = function (studentCount, {rowData}) {
  const manageStudentsUrl = teacherDashboardUrl(rowData.id, '/manage_students');
  const studentHtml =
    rowData.studentCount <= 0 ? (
      <Button
        __useDeprecatedTag
        text={i18n.addStudents()}
        href={manageStudentsUrl}
        color={Button.ButtonColor.neutralDark}
      />
    ) : (
      <a
        style={plTableLayoutStyles.link}
        href={manageStudentsUrl}
        aria-label={i18n.manageStudentsAriaLabel({
          numStudents: studentCount,
        })}
      >
        {rowData.studentCount}
      </a>
    );
  return studentHtml;
};

/**
 * This is a component that shows information about the Professional Learning sections that
 * a teacher owns, and allows for editing, deleting and sorting them.
 * It shows some of the same information as the SectionsAsStudentTable used on the teacher
 * homepage. However, for historical reasons it unfortunately has a somewhat
 * different set/shape of input data. This component gets its data from
 * section_api_helpers in pegasus via an AJAX call, whereas that component gets
 * its data from section.summarize on page load.
 * Both ultimately source data from the dashboard db.
 * Long term it would be ideal if section_api_helpers went away and both components
 * used dashboard.
 */
class OwnedPlSectionsTable extends Component {
  static propTypes = {
    sectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    onEdit: PropTypes.func.isRequired,

    //Provided by redux
    sectionRows: PropTypes.arrayOf(sortableSectionShape).isRequired,
    isRtl: PropTypes.bool,
  };

  state = {
    sortingColumns: {
      [COLUMNS.ID]: {
        direction: 'desc',
        position: 0,
      },
    },
  };

  participantNameFormatter = (participantType, {rowData}) => {
    return <div>{participantNames[rowData.participantType]}</div>;
  };

  actionCellFormatter = (temp, {rowData}) => {
    return (
      <SectionActionDropdown
        sectionData={rowData}
        handleEdit={this.props.onEdit}
      />
    );
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

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  getColumns = sortable => {
    return [
      {
        property: 'name',
        header: {
          label: i18n.section(),
          transforms: [sortable],
        },
        cell: {
          formatters: [sectionLinkFormatter],
        },
      },
      {
        property: 'participantType',
        header: {
          label: i18n.participants(),
          props: {
            className: 'uitest-participant-type-header',
          },
          transforms: [sortable],
        },
        cell: {
          formatters: [this.participantNameFormatter],
          props: {style: plTableLayoutStyles.participantTypeCell},
        },
      },
      {
        property: 'course',
        header: {
          label: i18n.course(),
        },
        cell: {
          formatters: [courseLinkFormatter],
        },
      },
      {
        property: 'studentCount',
        header: {
          label: i18n.students(),
          transforms: [sortable],
        },
        cell: {
          formatters: [studentsFormatter],
        },
      },
      {
        property: 'loginType',
        header: {
          label: i18n.loginInfo(),
        },
        cell: {
          formatters: [loginInfoFormatter],
        },
      },
      {
        property: 'actions',
        cell: {
          formatters: [this.actionCellFormatter],
          props: {style: {...plTableLayoutStyles.colButton}},
        },
      },
    ];
  };

  render() {
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
      sort: (x, y, z) => {
        return orderBy(x, y, z);
      },
    })(this.props.sectionRows);

    return (
      <Table.Provider columns={columns}>
        <Table.Header />
        <Table.Body
          className="uitest-sorted-rows"
          rows={sortedRows}
          rowKey="id"
        />
      </Table.Provider>
    );
  }
}

export const UnconnectedOwnedPlSectionsTable = OwnedPlSectionsTable;

export default connect((state, ownProps) => ({
  sectionRows: getSectionRows(state, ownProps.sectionIds),
  isRtl: state.isRtl,
}))(OwnedPlSectionsTable);
