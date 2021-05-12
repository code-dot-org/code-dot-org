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
import i18n from '@cdo/locale';

export default class ProgressTableStudentList extends React.Component {
  static propTypes = {
    rows: PropTypes.arrayOf(studentTableRowType).isRequired,
    onRow: PropTypes.func.isRequired,
    sectionId: PropTypes.number.isRequired,
    scriptData: scriptDataPropType.isRequired,
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    studentTimestamps: PropTypes.object,
    onToggleRow: PropTypes.func.isRequired,
    showSectionProgressDetails: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.cellFormatter = this.cellFormatter.bind(this);
  }

  header = null;
  body = null;
  bodyComponent = null;

  cellFormatter(_, {rowData}) {
    return this.rowTypeFormatter(rowData);
  }

  rowTypeFormatter(rowData) {
    switch (rowData.expansionIndex) {
      case 0:
        return this.studentNameFormatter(rowData);
      case 1:
        return this.expandedCellFormatter(i18n.timeSpentMins());
      case 2:
        return this.expandedCellFormatter(i18n.lastUpdatedTitle());
      default:
        return null;
    }
  }

  studentNameFormatter(rowData) {
    const {sectionId, scriptData, studentTimestamps} = this.props;
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
        studentUrl={studentUrl}
        onToggleExpand={this.props.onToggleRow}
        isExpanded={rowData.isExpanded}
        showSectionProgressDetails={this.props.showSectionProgressDetails}
      />
    );
  }

  expandedCellFormatter(text) {
    return <span style={styles.detailText}>{text}</span>;
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
          onRow={this.props.onRow}
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

const styles = {
  detailText: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
    paddingRight: '10px'
  }
};
