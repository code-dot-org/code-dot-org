import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {scriptDataPropType} from '../sectionProgressConstants';
import ProgressTableStudentName from './ProgressTableStudentName';
import progressTableStyles from './progressTableStyles.scss';

export default class ProgressTableStudentList extends React.Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    studentTimestamps: PropTypes.object,
    localeCode: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.studentNameFormatter = this.studentNameFormatter.bind(this);
    this.header = null;
    this.body = null;
  }

  studentNameFormatter(value, {rowData}) {
    const {section, scriptData, studentTimestamps, localeCode} = this.props;
    return (
      <ProgressTableStudentName
        name={value}
        studentId={rowData.id}
        sectionId={section.id}
        scriptName={scriptData.name}
        scriptId={scriptData.id}
        lastTimestamp={studentTimestamps[rowData.id]}
        localeCode={localeCode}
      />
    );
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
        columns={[
          {property: 'name', cell: {formatters: [this.studentNameFormatter]}}
        ]}
      >
        <Sticky.Header
          ref={r => (this.header = r && r.getRef())}
          tableBody={this.body}
          headerRows={this.props.headers.map(header => [
            {header: {label: header}}
          ])}
        />
        <Virtualized.Body
          rows={this.props.section.students}
          rowKey={'id'}
          style={{
            overflow: 'hidden',
            maxHeight: parseInt(progressTableStyles.MAX_BODY_HEIGHT)
          }}
          ref={tableBody => (this.body = tableBody && tableBody.getRef())}
          tableHeader={this.header}
        />
      </Table.Provider>
    );
  }
}
