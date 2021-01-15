import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {vocabularyShape} from '@cdo/apps/lib/levelbuilder/shapes';
import color from '@cdo/apps/util/color';
import SearchBox from './SearchBox';
import Dialog from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {
  addVocabulary,
  editVocabulary,
  removeVocabulary
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';

const styles = {
  oddRow: {
    backgroundColor: color.lightest_gray
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
    width: '98%'
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

  constructVocabularyOption = vocabulary => ({
    value: vocabulary.key,
    label: `${vocabulary.word} - ${vocabulary.definition}`,
    vocabulary
  });

  constructor(props) {
    super(props);
    this.state = {confirmRemovalDialogOpen: false, vocabularyForRemoval: null};
  }

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
    return (
      <div>
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
        <input
          type="hidden"
          name="vocabularies"
          value={JSON.stringify(this.props.vocabularies.map(v => v.key))}
        />
        <div>
          Select a vocabulary word to add
          <SearchBox
            onSearchSelect={e => this.props.addVocabulary(e.vocabulary)}
            courseVersionId={this.props.courseVersionId}
            searchUrl={'vocabularysearch'}
            constructOptions={this.constructSearchOptions}
          />
        </div>
        <div>
          <table style={{width: '100%'}}>
            <thead>
              <tr>
                <th style={{width: '20%'}}>Word</th>
                <th style={{width: '70%'}}>Definition</th>
                <th style={{width: '10%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.props.vocabularies.map((vocab, index) => (
                <tr
                  key={vocab.key}
                  style={index % 2 === 1 ? styles.oddRow : {}}
                >
                  <td>{vocab.word}</td>
                  <td>{vocab.definition}</td>
                  <td style={styles.actionsColumn}>
                    <div
                      style={styles.remove}
                      onMouseDown={() =>
                        this.setState({
                          confirmRemovalDialogOpen: true,
                          vocabularyForRemoval: vocab
                        })
                      }
                    >
                      <i className="fa fa-times" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
