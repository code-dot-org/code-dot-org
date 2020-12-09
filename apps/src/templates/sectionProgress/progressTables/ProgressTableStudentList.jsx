import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {scriptDataPropType, scrollbarWidth} from '../sectionProgressConstants';
import ProgressTableStudentName from './ProgressTableStudentName';
import progressTableStyles from './progressTableStyles.scss';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';

const styles = {
  gutter: {
    height: scrollbarWidth
  }
};
export default class ProgressTableStudentList extends React.Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    studentTimestamps: PropTypes.object,
    localeCode: PropTypes.string,
    needsGutter: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.studentNameFormatter = this.studentNameFormatter.bind(this);
  }

  header = null;
  body = null;
  bodyComponent = null;

  studentNameFormatter(value, {rowData}) {
    // Account for scrollbar in content view
    if (value === 'gutter') {
      return <div style={styles.gutter} />;
    }

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
    const rows = [...this.props.section.students];
    if (this.props.needsGutter) {
      // Account for scrollbar in content view
      rows.push({id: -1, name: 'gutter'});
    }

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
            {
              header: {
                label: header,
                props: {style: progressStyles.studentListContent}
              }
            }
          ])}
        />
        <Virtualized.Body
          rows={rows}
          rowKey={'id'}
          style={{
            overflow: 'hidden',
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
