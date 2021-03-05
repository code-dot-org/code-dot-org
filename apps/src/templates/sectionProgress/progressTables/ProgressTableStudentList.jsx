import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import {
  scriptDataPropType,
  studentTableRowType
} from '../sectionProgressConstants';
import ProgressTableStudentName from './ProgressTableStudentName';
import progressTableStyles from './progressTableStyles.scss';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import {scriptUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {ProgressTableTextLabelCell} from './ProgressTableTextCells';

export default class ProgressTableStudentList extends React.Component {
  static propTypes = {
    rows: PropTypes.arrayOf(studentTableRowType).isRequired,
    sectionId: PropTypes.number.isRequired,
    scriptData: scriptDataPropType.isRequired,
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    studentTimestamps: PropTypes.object,
    localeCode: PropTypes.string,
    onToggleRow: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.cellFormatter = this.cellFormatter.bind(this);
  }

  header = null;
  body = null;
  bodyComponent = null;

  cellFormatter(_, {rowData}) {
    switch (rowData.expansionIndex) {
      case 0:
        return this.studentNameFormatter(rowData);
      case 1:
        return this.timeSpentFormatter();
      case 2:
        return this.lastUpdatedFormatter();
      default:
        return null;
    }
  }

  studentNameFormatter(rowData) {
    const {sectionId, scriptData, studentTimestamps, localeCode} = this.props;
    const studentUrl = scriptUrlForStudent(
      sectionId,
      scriptData.name,
      rowData.student.id
    );
    return (
      <ProgressTableStudentName
        name={rowData.student.name}
        studentId={rowData.student.id}
        sectionId={sectionId}
        scriptId={scriptData.id}
        lastTimestamp={studentTimestamps[rowData.student.id]}
        localeCode={localeCode}
        studentUrl={studentUrl}
        onExpandToggle={() => {
          this.props.onToggleRow(rowData);
        }}
        isExpanded={rowData.isExpanded}
      />
    );
  }

  timeSpentFormatter() {
    return <ProgressTableTextLabelCell text={'Time Spent (mins)'} />;
  }

  lastUpdatedFormatter() {
    return <ProgressTableTextLabelCell text={'Last Updated'} />;
  }

  render() {
    return (
      <Table.Provider
        renderers={{
          body: {
            wrapper: Virtualized.BodyWrapper,
            row: Virtualized.BodyRow
          }
        }}
        columns={[{property: 'name', cell: {formatters: [this.cellFormatter]}}]}
      >
        <Sticky.Header
          ref={r => (this.header = r && r.getRef())}
          tableBody={this.body}
          headerRows={this.props.headers.map(header => [
            {
              header: {
                label: header,
                props: {style: progressStyles.studentListContent}
              }
            }
          ])}
        />
        <Virtualized.Body
          rows={this.props.rows}
          rowKey={'id'}
          style={{
            overflowX: 'scroll',
            overflowY: 'hidden',
            maxHeight: parseInt(progressTableStyles.MAX_BODY_HEIGHT)
          }}
          ref={r => {
            this.body = r && r.getRef();
            this.bodyComponent = r;
          }}
          tableHeader={this.header}
        />
      </Table.Provider>
    );
  }
}
