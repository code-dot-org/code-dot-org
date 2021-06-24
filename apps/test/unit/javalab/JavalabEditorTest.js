import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import {mount} from 'enzyme';
import JavalabEditor from '@cdo/apps/javalab/JavalabEditor';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import {EditorView} from '@codemirror/view';
import {oneDark} from '@codemirror/theme-one-dark';
import {lightMode} from '@cdo/apps/javalab/editorSetup';
import javalab, {
  setIsDarkMode,
  sourceVisibilityUpdated,
  sourceValidationUpdated
} from '@cdo/apps/javalab/javalabRedux';
import {setAllSources} from '../../../src/javalab/javalabRedux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';

describe('Java Lab Editor Test', () => {
  let defaultProps, store, appOptions;

  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
    registerReducers({javalab});
    store = getStore();
    defaultProps = {
      onCommitCode: () => {},
      handleVersionHistory: () => {}
    };
    appOptions = window.appOptions;
    window.appOptions = {level: {}};
    store.dispatch(
      setPageConstants({
        isEditingStartSources: false
      })
    );
  });

  afterEach(() => {
    restoreRedux();
    window.appOptions = appOptions;
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <JavalabEditor {...combinedProps} />
      </Provider>
    );
  };

  const editorHeaderButtonIdentifiers = [
    '#javalab-editor-create-file',
    '#data-mode-versions-header',
    '#javalab-editor-save',
    '#javalab-editor-backpack'
  ];

  describe('Editing Mode', () => {
    beforeEach(() => {
      store.dispatch(
        setPageConstants({
          isReadOnlyWorkspace: false
        })
      );
    });

    describe('toggleTabMenu', () => {
      it('Opens the menu after clicking on a tab if it is not open', () => {
        const editor = createWrapper();
        const firstTab = editor.find('NavItem').first();
        firstTab
          .find('button')
          .first()
          .props()
          .onClick({
            preventDefault: sinon.stub(),
            target: {
              getBoundingClientRect: () => {
                return {
                  bottom: 2,
                  left: 4
                };
              }
            }
          });
        expect(editor.find('JavalabEditor').instance().state.showMenu).to.be
          .true;
        expect(
          editor.find('JavalabEditor').instance().state.contextTarget
        ).to.equal('file-0');
        expect(
          editor.find('JavalabEditor').instance().state.menuPosition
        ).to.deep.equal({
          top: '2px',
          left: '4px'
        });
      });

      it('Closes the tab menu if it is open to that key', () => {
        const editor = createWrapper();
        editor
          .find('JavalabEditor')
          .instance()
          .setState({
            showMenu: true,
            contextTarget: 'file-0',
            menuPosition: {
              top: '2px',
              left: '4px'
            }
          });
        const firstTab = editor.find('NavItem').first();
        firstTab
          .find('button')
          .first()
          .props()
          .onClick({
            preventDefault: sinon.stub(),
            target: {
              getBoundingClientRect: () => {
                return {
                  bottom: 2,
                  left: 4
                };
              }
            }
          });
        expect(editor.find('JavalabEditor').instance().state.showMenu).to.be
          .false;
        expect(editor.find('JavalabEditor').instance().state.contextTarget).to
          .be.null;
      });
    });

    describe('Rename', () => {
      it('updates state and sources on rename save', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        const oldFilename = 'MyClass.java'; // default filename
        const newFilename = 'NewFilename.java';

        // should have default file in redux
        expect(store.getState().javalab.sources[oldFilename]).to.not.be
          .undefined;

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
          editTabKey: 'file-0',
          editTabFilename: oldFilename,
          openDialog: 'renameFile',
          orderedTabKeys: ['file-0', 'file-1'],
          fileMetadata: {
            'file-0': oldFilename,
            'file-1': 'AnotherClass.java'
          }
        });
        javalabEditor.onRenameFile(newFilename);
        expect(store.getState().javalab.sources[newFilename]).to.not.be
          .undefined;
        expect(store.getState().javalab.sources[oldFilename]).to.be.undefined;
        expect(javalabEditor.state.openDialog).to.be.null;
        expect(javalabEditor.state.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1'
        ]);
        expect(javalabEditor.state.fileMetadata).to.deep.equal({
          'file-0': newFilename,
          'file-1': 'AnotherClass.java'
        });
      });

      it('displays error message on a naming collision', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSources({
            'Class1.java': {text: '', isVisible: true, isValidation: false},
            'Class2.java': {text: '', isVisible: true, isValidation: false}
          })
        );

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
          editTabKey: 'file-0',
          editTabFilename: 'Class1.java',
          openDialog: 'renameFile',
          orderedTabKeys: ['file-0', 'file-1'],
          fileMetadata: {
            'file-0': 'Class1.java',
            'file-1': 'Class2.java'
          }
        });
        // we are trying to update Class1.java -> Class2.java here
        javalabEditor.onRenameFile('Class2.java');
        // after rename with existing filename, dialog should not close and
        // error message should be populated
        expect(store.getState().javalab.renameFileError).to.not.be.null;
        expect(javalabEditor.state.openDialog).to.equal('renameFile');
        expect(javalabEditor.state.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1'
        ]);
        expect(javalabEditor.state.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java'
        });
      });
    });

    describe('componentDidUpdate', () => {
      it('toggles between light and dark modes', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        const javalabCodeMirrors = javalabEditor.editors;
        const firstEditor = Object.values(javalabCodeMirrors)[0];

        const dispatchSpy = sinon.spy(firstEditor, 'dispatch');
        store.dispatch(setIsDarkMode(true));
        expect(dispatchSpy).to.have.been.calledWith({
          effects: javalabEditor.editorModeConfigCompartment.reconfigure(
            oneDark
          )
        });
        store.dispatch(setIsDarkMode(false));
        expect(dispatchSpy).to.have.been.calledWith({
          effects: javalabEditor.editorModeConfigCompartment.reconfigure(
            lightMode
          )
        });
      });
    });

    describe('File type updates', () => {
      it('updates visibility', () => {
        const first = 'Class0.java';
        const second = 'Class1.java';
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();

        javalabEditor.onCreateFile(first);
        javalabEditor.onCreateFile(second);

        expect(store.getState().javalab.sources[first].isVisible).to.be.true;
        expect(store.getState().javalab.sources[first].isValidation).to.be
          .false;
        store.dispatch(sourceVisibilityUpdated(first, false));
        expect(store.getState().javalab.sources[first].isVisible).to.be.false;
        expect(store.getState().javalab.sources[first].isValidation).to.be
          .false;

        expect(store.getState().javalab.sources[second].isVisible).to.be.true;
        expect(store.getState().javalab.sources[second].isValidation).to.be
          .false;
        store.dispatch(sourceVisibilityUpdated(second, false));
        store.dispatch(sourceValidationUpdated(second, true));
        expect(store.getState().javalab.sources[second].isVisible).to.be.false;
        expect(store.getState().javalab.sources[second].isValidation).to.be
          .true;
      });
    });

    describe('onOpenFile', () => {
      it('moves the selected tab to the front and selects it', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        javalabEditor.setState({
          activeTabKey: 'file-0',
          orderedTabKeys: ['file-0', 'file-1'],
          fileMetadata: {
            'file-0': 'file1.java',
            'file-1': 'file2.java'
          },
          showMenu: true,
          contextTarget: 'file-0'
        });
        javalabEditor.onOpenFile('file-1');
        expect(javalabEditor.state.activeTabKey).to.equal('file-1');
        expect(javalabEditor.state.orderedTabKeys).to.deep.equal([
          'file-1',
          'file-0'
        ]);
        expect(javalabEditor.state.showMenu).to.be.false;
        expect(javalabEditor.state.contextTarget).to.be.null;
      });
    });

    describe('Create New File', () => {
      it('updates state and sources on create save', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
          openDialog: 'createFile',
          orderedTabKeys: ['file-0', 'file-1'],
          lastTabKeyIndex: 1,
          fileMetadata: {
            'file-0': 'Class1.java',
            'file-1': 'Class2.java'
          }
        });
        const newFilename = 'Class3.java';
        javalabEditor.onCreateFile(newFilename);
        expect(store.getState().javalab.sources[newFilename]).to.not.be
          .undefined;
        expect(javalabEditor.state.openDialog).to.be.null;
        expect(javalabEditor.state.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1',
          'file-2'
        ]);
        expect(javalabEditor.state.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
          'file-2': newFilename
        });
      });

      it('displays error message on a naming collision', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSources({
            'Class1.java': {text: '', isVisible: true, isValidation: false},
            'Class2.java': {text: '', isVisible: true, isValidation: false}
          })
        );

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
          openDialog: 'createFile',
          orderedTabKeys: ['file-0', 'file-1'],
          lastTabKeyIndex: 1,
          fileMetadata: {
            'file-0': 'Class1.java',
            'file-1': 'Class2.java'
          }
        });
        const newFilename = 'Class2.java';
        javalabEditor.onCreateFile(newFilename);
        // after create with existing filename, dialog should not close and
        // error message should be populated
        expect(store.getState().javalab.newFileError).to.not.be.null;
        expect(javalabEditor.state.openDialog).to.equal('createFile');
        expect(javalabEditor.state.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1'
        ]);
        expect(javalabEditor.state.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java'
        });
      });
    });

    describe('Delete File', () => {
      it('updates state and sources on delete save', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
          openDialog: 'createFile',
          orderedTabKeys: ['file-0', 'file-1'],
          lastTabKeyIndex: 1,
          fileMetadata: {
            'file-0': 'Class1.java',
            'file-1': 'Class2.java'
          },
          activeTabKey: 'file-0',
          fileToDelete: 'file-0'
        });
        javalabEditor.onDeleteFile();
        expect(store.getState().javalab.sources['Class1.java']).to.be.undefined;
        expect(javalabEditor.state.openDialog).to.be.null;
        expect(javalabEditor.state.orderedTabKeys).to.deep.equal(['file-1']);
        expect(javalabEditor.state.fileMetadata).to.deep.equal({
          'file-1': 'Class2.java'
        });
      });

      it('can delete the only file in the editor', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
          openDialog: 'createFile',
          orderedTabKeys: ['file-0'],
          lastTabKeyIndex: 1,
          fileMetadata: {
            'file-0': 'Class1.java'
          },
          activeTabKey: 'file-0',
          fileToDelete: 'file-0'
        });
        javalabEditor.onDeleteFile();
        expect(store.getState().javalab.sources['Class1.java']).to.be.undefined;
        expect(javalabEditor.state.openDialog).to.be.null;
        expect(javalabEditor.state.activeTabKey).to.be.null;
        expect(javalabEditor.state.orderedTabKeys).to.deep.equal([]);
        expect(javalabEditor.state.fileMetadata).to.deep.equal({});
      });
    });

    describe('Read Only Mode', () => {
      it('is editable', () => {
        const editor = createWrapper();
        const javalabCodeMirrors = editor.find('JavalabEditor').instance()
          .editors;
        const firstEditor = Object.values(javalabCodeMirrors)[0];

        expect(firstEditor.state.facet(EditorView.editable)).to.be.true;
      });

      it('header buttons are enabled', () => {
        const editor = createWrapper();
        editorHeaderButtonIdentifiers.forEach(headerButtonId => {
          const isButtonDisabled = editor
            .find(headerButtonId)
            .first()
            .props().isDisabled;

          expect(isButtonDisabled).to.be.false;
        });
      });
    });
  });

  describe('View Only Mode', () => {
    beforeEach(() => {
      store.dispatch(
        setPageConstants({
          isReadOnlyWorkspace: true
        })
      );
    });

    it('is not editable', () => {
      const editor = createWrapper();
      const javalabCodeMirrors = editor.find('JavalabEditor').instance()
        .editors;
      const firstEditor = Object.values(javalabCodeMirrors)[0];

      expect(firstEditor.state.facet(EditorView.editable)).to.be.false;
    });

    it('header buttons are disabled', () => {
      const editor = createWrapper();
      editorHeaderButtonIdentifiers.forEach(headerButtonId => {
        const isButtonDisabled = editor
          .find(headerButtonId)
          .first()
          .props().isDisabled;

        expect(isButtonDisabled).to.be.true;
      });
    });
  });
});
