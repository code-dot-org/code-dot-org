import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import {lessonEditorTableStyles} from './lesson-editor/TableConstants';
import AddVocabularyDialog from './lesson-editor/AddVocabularyDialog';
import {connect} from 'react-redux';
import {
  addVocabulary,
  updateVocabulary,
  removeVocabulary
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import {vocabularyShape} from '@cdo/apps/lib/levelbuilder/shapes';
import Dialog from '@cdo/apps/templates/Dialog';

class AllVocabulariesEditor extends Component {
  static propTypes = {
    // Provided by redux
    vocabularies: PropTypes.arrayOf(vocabularyShape).isRequired,
    addVocabulary: PropTypes.func.isRequired,
    updateVocabulary: PropTypes.func.isRequired,
    removeVocabulary: PropTypes.func.isRequired,

    courseVersionId: PropTypes.number.isRequired,
    courseVersionLessons: PropTypes.arrayOf(PropTypes.object),
    courseName: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      vocabularyForEdit: null,
      vocabularyForDeletion: null,
      addVocabularyDialogOpen: false
    };
  }

  getColumns() {
    return [
      {
        property: 'actions',
        header: {
          label: 'Actions'
        },
        cell: {
          formatters: [this.actionsCellFormatter],
          props: {
            style: {
              ...lessonEditorTableStyles.actionsCell
            }
          }
        }
      },
      {
        property: 'word',
        header: {
          label: 'Word'
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
          label: 'Definition'
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      }
    ];
  }

  handleEdit = vocabularyForEdit => {
    this.setState({vocabularyForEdit, addVocabularyDialogOpen: true});
  };

  actionsCellFormatter = (actions, {rowData}) => {
    return (
      <div style={styles.actionsColumn}>
        <div onMouseDown={() => this.handleEdit(rowData)} style={styles.edit}>
          <i className="fa fa-edit" />
        </div>
        <div
          onMouseDown={() => this.setState({vocabularyForDeletion: rowData})}
          style={styles.remove}
          className={'unit-test-destroy-vocabulary'}
        >
          <i className="fa fa-trash" />
        </div>
      </div>
    );
  };

  afterVocabularySave = vocabulary => {
    if (this.state.vocabularyForEdit) {
      this.props.updateVocabulary(vocabulary);
    } else {
      this.props.addVocabulary(vocabulary);
    }
  };

  handleDeleteVocabularyDialogClose = () => {
    this.setState({
      vocabularyForDeletion: null
    });
  };

  handleDeleteVocabularyConfirm = () => {
    this.props.removeVocabulary(this.state.vocabularyForDeletion.key);
    this.handleDeleteVocabularyDialogClose();
  };

  handleAddVocabularyClick = e => {
    e.preventDefault();
    this.setState({addVocabularyDialogOpen: true});
  };

  render() {
    const columns = this.getColumns();
    return (
      <div>
        <div style={styles.header}>
          <h1>{`Vocabulary for ${this.props.courseName}`}</h1>
          <a
            onClick={this.handleAddVocabularyClick}
            style={styles.addButton}
            type="button"
          >
            <i className="fa fa-plus" style={{marginRight: 7}} />
            Create New Vocabulary
          </a>
        </div>
        {this.state.addVocabularyDialogOpen && (
          <AddVocabularyDialog
            editingVocabulary={this.state.vocabularyForEdit}
            afterSave={this.afterVocabularySave}
            handleClose={() =>
              this.setState({
                vocabularyForEdit: null,
                addVocabularyDialogOpen: false
              })
            }
            courseVersionId={this.props.courseVersionId}
            selectableLessons={this.props.courseVersionLessons}
          />
        )}
        {this.state.vocabularyForDeletion && (
          <Dialog
            body={`Are you sure you want to permanently delete vocabulary "${
              this.state.vocabularyForDeletion.word
            }"?`}
            cancelText="Cancel"
            confirmText="Delete"
            confirmType="danger"
            isOpen={true}
            handleClose={this.handleDeleteVocabularyDialogClose}
            onCancel={this.handleDeleteVocabularyDialogClose}
            onConfirm={this.handleDeleteVocabularyConfirm}
          />
        )}

        <Table.Provider columns={columns} style={{width: '100%'}}>
          <Table.Header />
          <Table.Body rows={this.props.vocabularies} rowKey="key" />
        </Table.Provider>
      </div>
    );
  }
}

const styles = {
  actionsColumn: {
    display: 'flex',
    justifyContent: 'space-evenly',
    backgroundColor: 'white'
  },
  remove: {
    fontSize: 14,
    cursor: 'pointer',
    textAlign: 'center',
    width: '50%',
    lineHeight: '30px'
  },
  edit: {
    fontSize: 14,
    cursor: 'pointer',
    textAlign: 'center',
    width: '50%',
    lineHeight: '30px'
  },
  addButton: {
    fontSize: 18,
    marginTop: 'auto',
    marginBottom: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between'
  }
};

export const UnconnectedAllVocabulariesEditor = AllVocabulariesEditor;

export default connect(
  state => ({vocabularies: state.vocabularies}),
  {addVocabulary, updateVocabulary, removeVocabulary}
)(AllVocabulariesEditor);
