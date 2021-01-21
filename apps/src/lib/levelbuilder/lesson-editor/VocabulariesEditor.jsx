import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {vocabularyShape} from '@cdo/apps/lib/levelbuilder/shapes';
import color from '@cdo/apps/util/color';
import SearchBox from './SearchBox';
import Dialog from '@cdo/apps/templates/Dialog';
import AddVocabularyDialog from './AddVocabularyDialog';
import {connect} from 'react-redux';
import {
  addVocabulary,
  editVocabulary,
  removeVocabulary
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import * as Table from 'reactabular-table';
import {lessonEditorTableStyles} from './TableConstants';

const styles = {
  search: {
    paddingBottom: 10
  },
  actionsColumn: {
    display: 'flex',
    justifyContent: 'space-evenly',
    backgroundColor: 'white'
  },
  remove: {
    fontSize: 14,
    color: 'white',
    background: color.dark_red,
    cursor: 'pointer',
    textAlign: 'center',
    width: '98%',
    lineHeight: '30px'
  }
};

class VocabulariesEditor extends Component {
  static propTypes = {
    courseVersionId: PropTypes.number,

    // Provided by redux
    vocabularies: PropTypes.arrayOf(vocabularyShape).isRequired,
    addVocabulary: PropTypes.func.isRequired,
    editVocabulary: PropTypes.func.isRequired,
    removeVocabulary: PropTypes.func.isRequired
  };

  actionsCellFormatter = (actions, {rowData}) => {
    return (
      <div style={styles.actionsColumn}>
        <div
          style={styles.remove}
          className="unit-test-remove-vocabulary"
          onMouseDown={() =>
            this.setState({
              confirmRemovalDialogOpen: true,
              vocabularyForRemoval: rowData
            })
          }
        >
          <i className="fa fa-trash" />
        </div>
      </div>
    );
  };

  getColumns() {
    return [
      {
        property: 'word',
        header: {
          label: 'Word',
          props: {
            style: {width: '20%'}
          }
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      },
      {
        property: 'definition',
        header: {
          label: 'Definition',
          props: {
            style: {width: '70%'}
          }
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      },
      {
        property: 'actions',
        header: {
          label: 'Actions',
          props: {
            style: {width: '10%'}
          }
        },
        cell: {
          formatters: [this.actionsCellFormatter],
          props: {
            style: {
              ...lessonEditorTableStyles.actionsCell
            }
          }
        }
      }
    ];
  }

  constructVocabularyOption = vocabulary => ({
    value: vocabulary.key,
    label: `${vocabulary.word} - ${vocabulary.definition}`,
    vocabulary
  });

  constructor(props) {
    super(props);
    this.state = {
      confirmRemovalDialogOpen: false,
      vocabularyForRemoval: null,
      newVocabularyDialogOpen: false
    };
  }

  handleAddVocabularyClick = () => {
    this.setState({newVocabularyDialogOpen: true});
  };

  constructSearchOptions = json => {
    const vocabKeysAdded = this.props.vocabularies.map(vocab => vocab.key);
    const vocabularies = json
      .map(vocab => this.constructVocabularyOption(vocab))
      .filter(vocab => vocabKeysAdded.indexOf(vocab.value) === -1);
    return {options: vocabularies};
  };

  handleRemoveVocabularyDialogClose = () => {
    this.setState({
      confirmRemovalDialogOpen: false,
      vocabularyForRemoval: null
    });
  };

  handleRemoveVocabularyConfirm = () => {
    this.props.removeVocabulary(this.state.vocabularyForRemoval.key);
    this.handleRemoveVocabularyDialogClose();
  };

  render() {
    const columns = this.getColumns();
    return (
      <div>
        {this.state.newVocabularyDialogOpen && (
          <AddVocabularyDialog
            handleClose={() => this.setState({newVocabularyDialogOpen: false})}
            courseVersionId={this.props.courseVersionId}
            afterSave={this.props.addVocabulary}
          />
        )}
        {this.state.confirmRemovalDialogOpen && (
          <Dialog
            body={`Are you sure you want to remove the vocabulary "${
              this.state.vocabularyForRemoval.word
            }" from this lesson?`}
            cancelText="Cancel"
            confirmText="Delete"
            confirmType="danger"
            isOpen={this.state.confirmRemovalDialogOpen}
            handleClose={this.handleRemoveVocabularyDialogClose}
            onCancel={this.handleRemoveVocabularyDialogClose}
            onConfirm={this.handleRemoveVocabularyConfirm}
          />
        )}
        <div style={styles.search}>
          Select a vocabulary word to add
          <SearchBox
            onSearchSelect={e => this.props.addVocabulary(e.vocabulary)}
            additionalQueryParams={{
              courseVersionId: this.props.courseVersionId
            }}
            searchUrl={'vocabularysearch'}
            constructOptions={this.constructSearchOptions}
          />
        </div>
        <Table.Provider columns={columns} style={{width: '100%'}}>
          <Table.Header />
          <Table.Body rows={this.props.vocabularies} rowKey="key" />
        </Table.Provider>
        <button
          onClick={this.handleAddVocabularyClick}
          style={styles.addButton}
          type="button"
        >
          <i className="fa fa-plus" style={{marginRight: 7}} /> Vocabulary
        </button>
      </div>
    );
  }
}

export const UnconnectedVocabulariesEditor = VocabulariesEditor;

export default connect(
  state => ({
    vocabularies: state.vocabularies
  }),
  {
    addVocabulary,
    editVocabulary,
    removeVocabulary
  }
)(VocabulariesEditor);
