import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {Table, sort} from 'reactabular';
import wrappedSortable from '../tables/wrapped_sortable';
import {tableLayoutStyles, sortableOptions} from "../tables/tableConstants";
import orderBy from 'lodash/orderBy';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import {h3Style} from "../../lib/ui/Headings";
import {validScriptPropType, setScriptId} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';

const styles = {
  emptyInfoText: {
    paddingTop: 20
  }
};

class TextResponses extends Component {
  static propTypes = {
    responses: PropTypes.array.isRequired,
    sectionId: PropTypes.number.isRequired,

    // provided by redux
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    scriptId: PropTypes.number,
    setScriptId: PropTypes.func.isRequired
  };

  state = {};

  onChangeScript = scriptId => {
    this.props.setScriptId(scriptId);
  };

  nameFormatter = (_, {rowData}) => {
    const {sectionId} = this.props;
    return (
      <a
        style={tableLayoutStyles.link}
        href={`/teacher-dashboard#/sections/${sectionId}/student/${rowData.student.id}`}
        target="_blank"
      >
        {rowData.student.name}
      </a>
    );
  };

  getSortingColumns = () => {
    return this.state.sortingColumns || {};
  };

  getColumns = (sortable) => {
    return [
      {
        property: 'name',
        header: {
          label: i18n.name(),
          props: {
            style: {
              ...tableLayoutStyles.headerCell
          }},
          transforms: [sortable]
        },
        cell: {
          format: this.nameFormatter,
          props: {
            style: {
              ...tableLayoutStyles.cell
          }}
        }
      },
      {
        property: 'stage',
        header: {
          label: 'Stage', // TODO: i18n
          props: {
            style: {
              ...tableLayoutStyles.headerCell
          }}
        },
        cell: {
          format: (_, {rowData}) => {return rowData.stage;},
          props: {
            style: {
              ...tableLayoutStyles.cell
          }}
        }
      },
      {
        property: 'puzzle',
        header: {
          label: 'Puzzle', // TODO: i18n
          props: {
            style: {
              ...tableLayoutStyles.headerCell
          }}
        },
        cell: {
          format: (_, {rowData}) => {return rowData.puzzle;},
          props: {
            style: {
              ...tableLayoutStyles.cell
          }}
        }
      },
      {
        property: 'question',
        header: {
          label: 'Question', // TODO: i18n
          props: {
            style: {
              ...tableLayoutStyles.headerCell
          }}
        },
        cell: {
          format: (_, {rowData}) => {return rowData.question;},
          props: {
            style: {
              ...tableLayoutStyles.cell
          }}
        }
      },
      {
        property: 'response',
        header: {
          label: 'Response', // TODO: i18n
          props: {
            style: {
              ...tableLayoutStyles.headerCell
          }}
        },
        cell: {
          format: (_, {rowData}) => {return rowData.response;},
          props: {
            style: {
              ...tableLayoutStyles.cell
          }}
        }
      },
    ];
  };

  // The user requested a new sorting column. Adjust the state accordingly.
  onSort = (selectedColumn) => {
    this.setState({
      sortingColumns: sort.byColumn({
        sortingColumns: this.state.sortingColumns,
        // Custom sortingOrder removes 'no-sort' from the cycle
        sortingOrder: {
          FIRST: 'asc',
          asc: 'desc',
          desc: 'asc'
        },
        selectedColumn
      })
    });
  };

  getRowKey = ({rowData}) => {
    return `${rowData.student.id}-${rowData.puzzle}`;
  };

  renderResponsesTable = () => {
    const {responses} = this.props;
    if (!responses.length) {
      return <div style={styles.emptyInfoText}>{i18n.emptyTextResponsesTable()}</div>;
    }

    // Define a sorting transform that can be applied to each column
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, sortableOptions);
    const columns = this.getColumns(sortable);
    const sortingColumns = this.getSortingColumns();

    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy,
    })(this.props.responses);

    return (
      <Table.Provider
        columns={columns}
        style={styles.table}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey={this.getRowKey} />
      </Table.Provider>
    );
  };

  render() {
    const {validScripts, scriptId} = this.props;

    return (
      <div>
        <div>
          <div style={h3Style}>
            {i18n.selectACourse()}
          </div>
          <ScriptSelector
            validScripts={validScripts}
            scriptId={scriptId}
            onChange={this.onChangeScript}
          />
        </div>
        {this.renderResponsesTable()}
      </div>
    );
  }
}

export const UnconnectedTextResponses = TextResponses;

export default connect(state => ({
  validScripts: state.sectionProgress.validScripts,
  scriptId: state.sectionProgress.scriptId,
}), dispatch => ({
  setScriptId(scriptId) {
    dispatch(setScriptId(scriptId));
  }
}))(TextResponses);
