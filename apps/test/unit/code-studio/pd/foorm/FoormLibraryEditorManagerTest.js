import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import FoormEntityEditor from '@cdo/apps/code-studio/pd/foorm/editor/components/FoormEntityEditor';
import FoormEntityLoadButtons from '@cdo/apps/code-studio/pd/foorm/editor/components/FoormEntityLoadButtons';
import {UnconnectedFoormLibraryEditorManager as FoormLibraryEditorManager} from '@cdo/apps/code-studio/pd/foorm/editor/library/FoormLibraryEditorManager';

global.$ = require('jquery');

describe('FoormLibraryEditorManager', () => {
  let defaultProps, server, wrapper;
  beforeEach(() => {
    // Default fake server is set up to respond to selection of a library
    // and return a single library question.
    server = sinon.fakeServer.create();
    server.respondWith('GET', /foorm\/libraries\/[0-9]+\/question_names/, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify([{id: 2, name: 'a_library_question_name', type: 'radio'}]),
    ]);

    defaultProps = {
      populateCodeMirror: () => {},
      resetCodeMirror: () => {},
      categories: ['surveys/pd'],
      questions: {},
      fetchableLibraries: [],
      fetchableLibraryQuestionsForCurrentLibrary: [],
      setFetchableLibraryQuestions: () => {},
      setLastSaved: () => {},
      setSaveError: () => {},
      setLibraryQuestionData: () => {},
      setHasJSONError: () => {},
      setHasLintError: () => {},
      setLastSavedQuestions: () => {},
      setLibraryData: () => {},
    };

    wrapper = shallow(<FoormLibraryEditorManager {...defaultProps} />);
  });

  afterEach(() => {
    server.restore();
  });

  const sampleExistingLibraryQuestionData = {
    question: {},
    name: 'sample_library_question_name',
    id: 0,
  };

  const sampleExistingLibraryData = {
    name: 'sample_library_name',
    version: 0,
    id: 1,
  };

  it('keeps library question choice disabled and editor hidden on load', () => {
    assert(wrapper.find(FoormEntityLoadButtons).at(1).prop('isDisabled'));

    assert.equal(wrapper.find(FoormEntityEditor).length, 0);
  });

  it('enables library question choice and keeps editor hidden on library load', () => {
    wrapper.find(FoormEntityLoadButtons).at(0).prop('onSelect')(
      sampleExistingLibraryData
    );

    assert(wrapper.find(FoormEntityLoadButtons).at(1).prop('isDisabled'));

    server.respond();
    // calls setFetchableLibraryQuestions which results in
    wrapper.setProps({
      libraryId: sampleExistingLibraryData.id,
      fetchableLibraryQuestionsForCurrentLibrary: [
        sampleExistingLibraryQuestionData,
      ],
    });

    assert.isFalse(
      wrapper.find(FoormEntityLoadButtons).at(1).prop('isDisabled')
    );
  });

  it('waits to show editor until library question load', () => {
    server.respondWith('GET', '/foorm/library_questions/0', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleExistingLibraryQuestionData),
    ]);

    assert.equal(wrapper.find(FoormEntityEditor).length, 0);

    wrapper.find(FoormEntityLoadButtons).at(0).prop('onSelect')(
      sampleExistingLibraryData
    );

    server.respond();
    wrapper.update();

    assert.equal(wrapper.find(FoormEntityEditor).length, 0);

    wrapper.find(FoormEntityLoadButtons).at(1).prop('onSelect')(
      sampleExistingLibraryQuestionData
    );

    server.respond();
    wrapper.update();

    assert.equal(wrapper.find(FoormEntityEditor).length, 1);
  });
});
