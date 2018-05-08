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

const TABLE_WIDTH = tableLayoutStyles.table.width;
const TABLE_COLUMN_WIDTHS = {
  name: TABLE_WIDTH / 5,
  stage: TABLE_WIDTH / 5,
  puzzle: TABLE_WIDTH / 6,
  question: TABLE_WIDTH / 5,
  response: TABLE_WIDTH / 4
};
const RESPONSE_CHARACTER_LIMIT = 100;

const styles = {
  header: {
    marginBottom: 0
  },
  table: {
    paddingTop: 10
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
        >
          ...see full response
        </a>
      </div>
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
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.name}
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
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.stage}
          }},
          transforms: [sortable]
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
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.puzzle}
          }},
          transforms: [sortable]
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
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.question}
          }},
          transforms: [sortable]
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
              ...tableLayoutStyles.headerCell,
              ...{width: TABLE_COLUMN_WIDTHS.response}
          }}
        },
        cell: {
          format: this.responseFormatter,
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
      return i18n.emptyTextResponsesTable();
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
          <div style={{...h3Style, ...styles.header}}>
            {i18n.selectACourse()}
          </div>
          <ScriptSelector
            validScripts={validScripts}
            scriptId={scriptId}
            onChange={this.onChangeScript}
          />
        </div>
        <div style={styles.table}>
          {this.renderResponsesTable()}
        </div>
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
