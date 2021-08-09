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
  updateVocabulary,
  removeVocabulary
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import * as Table from 'reactabular-table';
import {lessonEditorTableStyles} from './TableConstants';

class VocabulariesEditor extends Component {
  static propTypes = {
    courseVersionId: PropTypes.number,

    // Provided by redux
    vocabularies: PropTypes.arrayOf(vocabularyShape).isRequired,
    addVocabulary: PropTypes.func.isRequired,
    updateVocabulary: PropTypes.func.isRequired,
    removeVocabulary: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      confirmRemovalDialogOpen: false,
      vocabularyForRemoval: null,
      newVocabularyDialogOpen: false,
      vocabularyForEdit: null
    };
  }

  actionsCellFormatter = (actions, {rowData}) => {
    return (
      <div style={styles.actionsColumn}>
        <div
          style={styles.edit}
          onMouseDown={() =>
            this.setState({
              newVocabularyDialogOpen: true,
              vocabularyForEdit: rowData
            })
          }
        >
          <i className="fa fa-edit" />
        </div>
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

  afterVocabularySave = vocabulary => {
    if (this.state.vocabularyForEdit) {
      this.props.updateVocabulary(vocabulary);
    } else {
      this.props.addVocabulary(vocabulary);
    }
  };

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
            handleClose={() =>
              this.setState({
                newVocabularyDialogOpen: false,
                vocabularyForEdit: null
              })
            }
            courseVersionId={this.props.courseVersionId}
            afterSave={this.afterVocabularySave}
            editingVocabulary={this.state.vocabularyForEdit}
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
          <label>
            <strong>Select a vocabulary word to add</strong>
          </label>
          <SearchBox
            onSearchSelect={e => this.props.addVocabulary(e.vocabulary)}
            additionalQueryParams={{
              courseVersionId: this.props.courseVersionId
            }}
            searchUrl={'vocabularies/search'}
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
          <i className="fa fa-plus" style={{marginRight: 7}} /> Create New
          Vocabulary
        </button>
      </div>
    );
  }
}

const styles = {
  search: {
    paddingBottom: 10
  },
  actionsColumn: {
    display: 'flex',
    justifyContent: 'space-evenly',
    backgroundColor: 'white'
  },
  edit: {
    fontSize: 14,
    color: 'white',
    background: color.default_blue,
    cursor: 'pointer',
    textAlign: 'center',
    width: '50%',
    lineHeight: '30px'
  },
  remove: {
    fontSize: 14,
    color: 'white',
    background: color.dark_red,
    cursor: 'pointer',
    textAlign: 'center',
    width: '50%',
    lineHeight: '30px'
  },
  addButton: {
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    padding: 7,
    textAlign: 'center',
    marginTop: 10,
    marginLeft: 0
  }
};

export const UnconnectedVocabulariesEditor = VocabulariesEditor;

export default connect(
  state => ({
    vocabularies: state.vocabularies
  }),
  {
    addVocabulary,
    updateVocabulary,
    removeVocabulary
  }
)(VocabulariesEditor);
