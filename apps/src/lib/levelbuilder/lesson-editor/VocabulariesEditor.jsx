import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {vocabularyShape} from '@cdo/apps/lib/levelbuilder/shapes';
import color from '@cdo/apps/util/color';
import {connect} from 'react-redux';
import {
  addVocabulary,
  editVocabulary,
  removeVocabulary
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';

const styles = {
  oddRow: {
    backgroundColor: color.lightest_gray
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

  render() {
    return (
      <div>
        <input
          type="hidden"
          name="vocabularies"
          value={JSON.stringify(this.props.vocabularies.map(v => v.key))}
        />
        <div>
          <table style={{width: '100%'}}>
            <thead>
              <tr>
                <th style={{width: '30%'}}>Word</th>
                <th style={{width: '70%'}}>Definition</th>
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
