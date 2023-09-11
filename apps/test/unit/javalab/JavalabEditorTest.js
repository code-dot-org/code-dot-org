import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import {mount} from 'enzyme';
import JavalabEditor from '@cdo/apps/javalab/JavalabEditor';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
} from '@cdo/apps/redux';
import {EditorView} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import javalab, {
  setIsReadOnlyWorkspace,
  setHasOpenCodeReview,
  setBackpackEnabled,
} from '@cdo/apps/javalab/redux/javalabRedux';
import javalabEditor, {
  sourceFileOrderUpdated,
  sourceVisibilityUpdated,
  sourceValidationUpdated,
  setEditTabKey,
  setOrderedTabKeys,
  setFileMetadata,
  setActiveTabKey,
  setAllEditorMetadata,
  setAllSourcesAndFileMetadata,
  setAllValidation,
  openEditorDialog,
} from '@cdo/apps/javalab/redux/editorRedux';
import javalabView, {setDisplayTheme} from '@cdo/apps/javalab/redux/viewRedux';

import {DisplayTheme} from '@cdo/apps/javalab/DisplayTheme';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import {allowConsoleWarnings} from '../../util/throwOnConsole';
import BackpackClientApi from '@cdo/apps/code-studio/components/backpack/BackpackClientApi';
import javalabMsg from '@cdo/javalab/locale';
import {JavalabEditorDialog} from '@cdo/apps/javalab/types';
import {darkMode, lightMode} from '@cdo/apps/javalab/editorThemes';
import {BackpackAPIContext} from '../../../src/javalab/BackpackAPIContext';

describe('Java Lab Editor Test', () => {
  // Warnings allowed due to usage of deprecated componentWillReceiveProps
  // lifecycle method.
  allowConsoleWarnings();

  let defaultProps, store, appOptions, backpackApiStub;

  beforeEach(() => {
    __testing_stubRedux();
    registerReducers(commonReducers);
    registerReducers({javalab, javalabEditor, javalabView});
    store = getStore();
    defaultProps = {
      onCommitCode: () => {},
      handleVersionHistory: () => {},
      showProjectTemplateWorkspaceIcon: false,
      isProjectTemplateLevel: false,
      height: 400,
      handleClearPuzzle: () => {},
    };
    appOptions = window.appOptions;
    window.appOptions = {level: {}};
    store.dispatch(
      setPageConstants({
        isEditingStartSources: false,
      })
    );

    backpackApiStub = sinon.createStubInstance(BackpackClientApi);
    backpackApiStub.hasBackpack.returns(true);
    backpackApiStub.getFileList.callsArgWith(1, ['backpackFile.java']);

    store.dispatch(setBackpackEnabled(true));
  });

  afterEach(() => {
    __testing_restoreRedux();
    window.appOptions = appOptions;
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <BackpackAPIContext.Provider value={backpackApiStub}>
          <JavalabEditor {...combinedProps} />
        </BackpackAPIContext.Provider>
      </Provider>
    );
  };

  const backpackHeaderButtonId = '#javalab-editor-backpack';
  const editorHeaderButtonIdentifiers = [
    '#javalab-editor-create-file',
    '#data-mode-versions-header',
    '#javalab-editor-save',
    backpackHeaderButtonId,
  ];

  describe('Editing Mode', () => {
    beforeEach(() => {
      store.dispatch(setIsReadOnlyWorkspace(false));
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
                  left: 4,
                };
              },
            },
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
          left: '4px',
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
              left: '4px',
            },
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
                  left: 4,
                };
              },
            },
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
        expect(store.getState().javalabEditor.sources[oldFilename]).to.not.be
          .undefined;

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.RENAME_FILE));
        store.dispatch(setEditTabKey('file-0'));
        store.dispatch(setOrderedTabKeys(['file-0', 'file-1']));
        store.dispatch(
          setFileMetadata({
            'file-0': oldFilename,
            'file-1': 'AnotherClass.java',
          })
        );

        javalabEditor.onRenameFile(newFilename);
        expect(store.getState().javalabEditor.sources[newFilename]).to.not.be
          .undefined;
        expect(store.getState().javalabEditor.sources[oldFilename]).to.be
          .undefined;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.be.null;
        expect(store.getState().javalabEditor.renameFileError).to.be.null;
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1',
        ]);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': newFilename,
          'file-1': 'AnotherClass.java',
        });
      });

      it('displays error message on a naming collision', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
            'Class2.java': {
              text: '',
              tabOrder: 1,
              isVisible: true,
              isValidation: false,
            },
          })
        );

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.RENAME_FILE));
        // we are trying to update Class1.java -> Class2.java here
        javalabEditor.onRenameFile('Class2.java');
        // after rename with existing filename, dialog should not close and
        // error message should be populated
        expect(store.getState().javalabEditor.renameFileError).to.exist;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.RENAME_FILE
        );
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1',
        ]);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
        });
      });

      it('displays error message on a validation naming collision', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
          })
        );

        store.dispatch(
          setAllValidation({
            'Validation.java': {
              text: '',
              tabOrder: 1,
              isVisible: false,
              isValidation: true,
            },
          })
        );

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.RENAME_FILE));
        // we are trying to update Class1.java -> Validation.java here
        javalabEditor.onRenameFile('Validation.java');
        // after rename with existing filename, dialog should not close and
        // error message should be populated
        expect(store.getState().javalabEditor.renameFileError).to.exist;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.RENAME_FILE
        );
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal(['file-0']);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
        });
      });

      it('displays error message if file name is blank', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
          })
        );

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.RENAME_FILE));

        expect(store.getState().javalabEditor.renameFileError).to.be.null;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.RENAME_FILE
        );
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
        });

        // We are trying to rename Class1.java -> ''
        javalabEditor.onRenameFile('');

        expect(store.getState().javalabEditor.renameFileError).to.exist;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.RENAME_FILE
        );
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
        });
      });

      it('displays error message if file name is an invalid java file name', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
          })
        );

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.RENAME_FILE));

        expect(store.getState().javalabEditor.renameFileError).to.be.null;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.RENAME_FILE
        );
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
        });

        // We are trying to rename Class1.java -> ''
        javalabEditor.onRenameFile('an invalid file name .java');

        expect(store.getState().javalabEditor.renameFileError).to.exist;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.RENAME_FILE
        );
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
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
        store.dispatch(setDisplayTheme(DisplayTheme.DARK));
        expect(dispatchSpy).to.have.been.calledWith({
          effects:
            javalabEditor.editorModeConfigCompartment.reconfigure(darkMode),
        });
        store.dispatch(setDisplayTheme(DisplayTheme.LIGHT));
        expect(dispatchSpy).to.have.been.calledWith({
          effects:
            javalabEditor.editorModeConfigCompartment.reconfigure(lightMode),
        });
        dispatchSpy.restore();
      });

      it('toggles between read-only and editable', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        const javalabCodeMirrors = javalabEditor.editors;
        const firstEditor = Object.values(javalabCodeMirrors)[0];

        const dispatchSpy = sinon.spy(firstEditor, 'dispatch');
        store.dispatch(setIsReadOnlyWorkspace(true));
        expect(dispatchSpy).to.have.been.called;
        expect(firstEditor.state.facet(EditorView.editable)).to.be.false;
        expect(firstEditor.state.facet(EditorState.readOnly)).to.be.true;

        store.dispatch(setIsReadOnlyWorkspace(false));
        expect(dispatchSpy).to.have.been.called;
        expect(firstEditor.state.facet(EditorView.editable)).to.be.true;
        expect(firstEditor.state.facet(EditorState.readOnly)).to.be.false;

        dispatchSpy.restore();
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

        expect(store.getState().javalabEditor.sources[first].isVisible).to.be
          .true;
        expect(store.getState().javalabEditor.sources[first].isValidation).to.be
          .false;
        store.dispatch(sourceVisibilityUpdated(first, false));
        expect(store.getState().javalabEditor.sources[first].isVisible).to.be
          .false;
        expect(store.getState().javalabEditor.sources[first].isValidation).to.be
          .false;

        expect(store.getState().javalabEditor.sources[second].isVisible).to.be
          .true;
        expect(store.getState().javalabEditor.sources[second].isValidation).to
          .be.false;
        store.dispatch(sourceVisibilityUpdated(second, false));
        store.dispatch(sourceValidationUpdated(second, true));
        expect(store.getState().javalabEditor.sources[second].isVisible).to.be
          .false;
        expect(store.getState().javalabEditor.sources[second].isValidation).to
          .be.true;
      });
    });

    describe('onOpenFile', () => {
      it('moves the selected tab to the front and selects it', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        javalabEditor.setState({
          showMenu: true,
          contextTarget: 'file-0',
        });
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
            'Class2.java': {
              text: '',
              tabOrder: 1,
              isVisible: true,
              isValidation: false,
            },
          })
        );
        store.dispatch(setActiveTabKey('file-0'));
        javalabEditor.onOpenFile('file-1');

        expect(javalabEditor.props.activeTabKey).to.equal('file-1');
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
          'file-1',
          'file-0',
        ]);
        expect(javalabEditor.state.showMenu).to.be.false;
        expect(javalabEditor.state.contextTarget).to.be.null;
      });
      it('moves the selected tab to the front and source is updated so order of tabs persist', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        javalabEditor.setState({
          showMenu: true,
          contextTarget: 'file-0',
        });
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'ClassName1.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
            'ClassName2.java': {
              text: '',
              tabOrder: 1,
              isVisible: true,
              isValidation: false,
            },
            'ClassName3.java': {
              text: '',
              tabOrder: 2,
              isVisible: true,
              isValidation: false,
            },
          })
        );
        store.dispatch(setOrderedTabKeys(['file-2', 'file-0', 'file-1']));
        store.dispatch(sourceFileOrderUpdated());
        const sources = store.getState().javalabEditor.sources;
        const file0 = sources['ClassName1.java'];
        const file1 = sources['ClassName2.java'];
        const file2 = sources['ClassName3.java'];
        expect(file0.tabOrder).to.equal(1);
        expect(file1.tabOrder).to.equal(2);
        expect(file2.tabOrder).to.equal(0);
      });
    });

    describe('Moving file tabs', () => {
      describe('When there are 3 or more tabs in Java Lab editor', () => {
        let editor;
        let javalabEditor;
        beforeEach(() => {
          editor = createWrapper();
          javalabEditor = editor.find('JavalabEditor').instance();
          store.dispatch(
            setAllSourcesAndFileMetadata({
              'Class1.java': {
                text: '',
                tabOrder: 0,
                isVisible: true,
                isValidation: false,
              },
              'Class2.java': {
                text: '',
                tabOrder: 1,
                isVisible: true,
                isValidation: false,
              },
              'Class3.java': {
                text: '',
                tabOrder: 2,
                isVisible: true,
                isValidation: false,
              },
            })
          );
        });

        it('When moveTabLeft is called, activeTab is swapped with tab to the left', () => {
          javalabEditor.setState({
            showMenu: true,
            contextTarget: 'file-1',
          });
          store.dispatch(setActiveTabKey('file-1'));
          javalabEditor.moveTabLeft();
          expect(javalabEditor.props.activeTabKey).to.equal('file-1');
          expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
            'file-1',
            'file-0',
            'file-2',
          ]);
          expect(javalabEditor.state.showMenu).to.be.false;
          expect(javalabEditor.state.contextTarget).to.be.null;
        });

        it('When moveTabRight is called, activeTab is swapped with tab to the right', () => {
          javalabEditor.setState({
            showMenu: true,
            contextTarget: 'file-1',
          });
          store.dispatch(setActiveTabKey('file-1'));
          javalabEditor.moveTabRight();
          expect(javalabEditor.props.activeTabKey).to.equal('file-1');
          expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
            'file-0',
            'file-2',
            'file-1',
          ]);
          expect(javalabEditor.state.showMenu).to.be.false;
          expect(javalabEditor.state.contextTarget).to.be.null;
        });

        it('When moveTabLeft is called and activeTab is leftmost tab, no change occurs', () => {
          javalabEditor.setState({
            showMenu: true,
            contextTarget: 'file-0',
          });
          store.dispatch(setActiveTabKey('file-0'));
          javalabEditor.moveTabLeft();
          expect(javalabEditor.props.activeTabKey).to.equal('file-0');
          expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
            'file-0',
            'file-1',
            'file-2',
          ]);
          expect(javalabEditor.state.showMenu).to.be.false;
          expect(javalabEditor.state.contextTarget).to.be.null;
        });

        it('When moveTabRight is called and activeTab is rightmost tab, no change occurs', () => {
          javalabEditor.setState({
            showMenu: true,
            contextTarget: 'file-2',
          });
          store.dispatch(setActiveTabKey('file-2'));
          javalabEditor.moveTabRight();
          expect(javalabEditor.props.activeTabKey).to.equal('file-2');
          expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
            'file-0',
            'file-1',
            'file-2',
          ]);
          expect(javalabEditor.state.showMenu).to.be.false;
          expect(javalabEditor.state.contextTarget).to.be.null;
        });
      });

      describe('When there is only one tab in Java Lab editor', () => {
        it('When moveTabRight and moveTabLeft are called and there is only one file, no change occurs', () => {
          const editor = createWrapper();
          const javalabEditor = editor.find('JavalabEditor').instance();
          javalabEditor.setState({
            showMenu: true,
            contextTarget: 'file-0',
          });
          store.dispatch(setActiveTabKey('file-0'));
          store.dispatch(setOrderedTabKeys(['file-0']));
          javalabEditor.moveTabRight();
          expect(javalabEditor.props.activeTabKey).to.equal('file-0');
          expect(javalabEditor.props.orderedTabKeys).to.deep.equal(['file-0']);
          javalabEditor.moveTabLeft();
          expect(javalabEditor.props.activeTabKey).to.equal('file-0');
          expect(javalabEditor.props.orderedTabKeys).to.deep.equal(['file-0']);
          expect(javalabEditor.state.showMenu).to.be.false;
          expect(javalabEditor.state.contextTarget).to.be.null;
        });
      });
    });

    describe('tabOrders of files in sources', () => {
      it('When there gaps in file tabOrders (projects with validation and hidden files', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
            'Class2.java': {
              text: '',
              tabOrder: 2,
              isVisible: true,
              isValidation: false,
            },
            'Class3.java': {
              text: '',
              tabOrder: 4,
              isVisible: true,
              isValidation: false,
            },
          })
        );
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1',
          'file-2',
        ]);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
          'file-2': 'Class3.java',
        });
      });
      it('When file tabOrders are invalid - tabOrders undefined', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: '',
              isVisible: true,
              isValidation: false,
            },
            'Class2.java': {
              text: '',
              isVisible: true,
              isValidation: false,
            },
            'Class3.java': {
              text: '',
              isVisible: true,
              isValidation: false,
            },
          })
        );
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1',
          'file-2',
        ]);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
          'file-2': 'Class3.java',
        });
      });
      it('When file tabOrders are invalid - duplicate tabOrders', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
            'Class2.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
            'Class3.java': {
              text: '',
              tabOrder: 1,
              isVisible: true,
              isValidation: false,
            },
          })
        );
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1',
          'file-2',
        ]);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
          'file-2': 'Class3.java',
        });
      });
    });

    describe('Create New File', () => {
      it('updates state and sources on create save', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.CREATE_FILE));

        const fileMetadata = {
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
        };
        const orderedTabKeys = ['file-0', 'file-1'];
        const activeTabKey = 'file-0';
        const lastTabKeyIndex = 1;
        store.dispatch(
          setAllEditorMetadata(
            fileMetadata,
            orderedTabKeys,
            activeTabKey,
            lastTabKeyIndex
          )
        );

        const newFilename = 'Class3.java';
        javalabEditor.onCreateFile(newFilename);
        expect(store.getState().javalabEditor.sources[newFilename]).to.not.be
          .undefined;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.be.null;
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1',
          'file-2',
        ]);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
          'file-2': newFilename,
        });
      });

      it('displays error message on a naming collision', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {text: '', isVisible: true, isValidation: false},
            'Class2.java': {text: '', isVisible: true, isValidation: false},
          })
        );
        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.CREATE_FILE));
        const newFilename = 'Class2.java';

        javalabEditor.onCreateFile(newFilename);

        // after create with existing filename, dialog should not close and
        // error message should be populated
        expect(store.getState().javalabEditor.newFileError).to.exist;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.CREATE_FILE
        );
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal([
          'file-0',
          'file-1',
        ]);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
        });
      });

      it('displays error message on a validation naming collision', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllValidation({
            'Validation.java': {text: '', isVisible: false, isValidation: true},
          })
        );
        store.dispatch(setAllEditorMetadata({}, [], null, 0));
        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.CREATE_FILE));
        javalabEditor.onCreateFile('Validation.java');

        // after create with existing filename, dialog should not close and
        // error message should be populated
        expect(store.getState().javalabEditor.newFileError).to.exist;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.CREATE_FILE
        );
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal([]);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({});
      });

      it('displays error message if file name is blank', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {text: '', isVisible: true, isValidation: false},
          })
        );

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.CREATE_FILE));

        expect(store.getState().javalabEditor.newFileError).to.be.null;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.CREATE_FILE
        );
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
        });

        javalabEditor.onCreateFile('');

        expect(store.getState().javalabEditor.newFileError).to.exist;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.CREATE_FILE
        );
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
        });
      });

      it('displays error message if file name is an invalid java file name', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {text: '', isVisible: true, isValidation: false},
          })
        );

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.CREATE_FILE));

        expect(store.getState().javalabEditor.newFileError).to.be.null;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.CREATE_FILE
        );
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
        });

        javalabEditor.onCreateFile('an invalid file name .java');

        expect(store.getState().javalabEditor.newFileError).to.exist;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.equal(
          JavalabEditorDialog.CREATE_FILE
        );
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-0': 'Class1.java',
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
          fileToDelete: 'file-0',
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.DELETE_FILE));
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
            'Class2.java': {
              text: '',
              tabOrder: 1,
              isVisible: true,
              isValidation: false,
            },
          })
        );
        store.dispatch(setActiveTabKey('file-0'));
        javalabEditor.onDeleteFile();
        expect(store.getState().javalabEditor.sources['Class1.java']).to.be
          .undefined;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.be.null;
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal(['file-1']);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({
          'file-1': 'Class2.java',
        });
      });

      it('can delete the only file in the editor', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();

        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
          fileToDelete: 'file-0',
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.DELETE_FILE));

        const fileMetadata = {
          'file-0': 'Class1.java',
        };
        const orderedTabKeys = ['file-0'];
        const activeTabKey = 'file-0';
        const lastTabKeyIndex = 0;
        store.dispatch(
          setAllEditorMetadata(
            fileMetadata,
            orderedTabKeys,
            activeTabKey,
            lastTabKeyIndex
          )
        );

        javalabEditor.onDeleteFile();
        expect(store.getState().javalabEditor.sources['Class1.java']).to.be
          .undefined;
        expect(store.getState().javalabEditor.editorOpenDialogName).to.be.null;
        expect(javalabEditor.props.activeTabKey).to.be.null;
        expect(javalabEditor.props.orderedTabKeys).to.deep.equal([]);
        expect(javalabEditor.props.fileMetadata).to.deep.equal({});
      });

      it('updates sources when file is deleted', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
          fileToDelete: 'file-0',
        });
        store.dispatch(openEditorDialog(JavalabEditorDialog.DELETE_FILE));
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'ClassName1.java': {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
            'ClassName2.java': {
              text: '',
              tabOrder: 1,
              isVisible: true,
              isValidation: false,
            },
            'ClassName3.java': {
              text: '',
              tabOrder: 2,
              isVisible: true,
              isValidation: false,
            },
          })
        );
        javalabEditor.onDeleteFile();
        store.dispatch(sourceFileOrderUpdated());
        const sources = store.getState().javalabEditor.sources;
        const file1 = sources['ClassName2.java'];
        const file2 = sources['ClassName3.java'];

        expect(store.getState().javalabEditor.sources['Class1.java']).to.be
          .undefined;
        expect(file1.tabOrder).to.equal(0);
        expect(file2.tabOrder).to.equal(1);
      });
    });

    describe('Import File', () => {
      it('can overwrite an existing file', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();
        const oldText = 'hello';
        const newText = 'hello world';

        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: oldText,
              isVisible: true,
              isValidation: false,
            },
            'Class2.java': {text: '', isVisible: true, isValidation: false},
          })
        );
        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });
        javalabEditor.onImportFile('Class1.java', newText);
        expect(
          store.getState().javalabEditor.sources['Class1.java'].text
        ).to.equal(newText);
        expect(javalabEditor.props.orderedTabKeys.length).to.equal(2);
      });

      it('can create a new file', () => {
        const editor = createWrapper();
        const javalabEditor = editor.find('JavalabEditor').instance();

        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {
              text: '',
              isVisible: true,
              isValidation: false,
            },
            'Class2.java': {text: '', isVisible: true, isValidation: false},
          })
        );
        javalabEditor.setState({
          showMenu: false,
          contextTarget: null,
        });

        javalabEditor.onImportFile('Class3.java', 'hello');
        expect(
          store.getState().javalabEditor.sources['Class3.java'].text
        ).to.equal('hello');
        expect(javalabEditor.props.orderedTabKeys.length).to.equal(3);
      });
    });

    it('is editable', () => {
      const editor = createWrapper();
      const javalabCodeMirrors = editor
        .find('JavalabEditor')
        .instance().editors;
      const firstEditor = Object.values(javalabCodeMirrors)[0];

      expect(firstEditor.state.facet(EditorView.editable)).to.be.true;
    });

    it('header buttons are enabled', () => {
      const editor = createWrapper();
      editorHeaderButtonIdentifiers.forEach(headerButtonId => {
        const propName =
          headerButtonId === backpackHeaderButtonId
            ? 'isButtonDisabled'
            : 'isDisabled';
        const isButtonDisabled = editor.find(headerButtonId).first().props()[
          propName
        ];

        expect(isButtonDisabled).to.be.false;
      });
    });

    it('hides backpack button if disabled', () => {
      store.dispatch(setBackpackEnabled(false));
      const editor = createWrapper();
      expect(editor.find(backpackHeaderButtonId)).to.have.lengthOf(0);
    });

    it('does not display code review readonly banner', () => {
      const editor = createWrapper();
      expect(editor.find('div#openCodeReviewWarningBanner')).to.have.lengthOf(
        0
      );
    });
  });

  describe('View Only Mode', () => {
    beforeEach(() => {
      store.dispatch(setIsReadOnlyWorkspace(true));
    });

    it('is not editable', () => {
      const editor = createWrapper();
      const javalabCodeMirrors = editor
        .find('JavalabEditor')
        .instance().editors;
      const firstEditor = Object.values(javalabCodeMirrors)[0];

      expect(firstEditor.state.facet(EditorView.editable)).to.be.false;
      expect(firstEditor.state.facet(EditorState.readOnly)).to.be.true;
    });

    it('header buttons are disabled', () => {
      const editor = createWrapper();
      editorHeaderButtonIdentifiers.forEach(headerButtonId => {
        const propName =
          headerButtonId === backpackHeaderButtonId
            ? 'isButtonDisabled'
            : 'isDisabled';
        const isButtonDisabled = editor.find(headerButtonId).first().props()[
          propName
        ];

        expect(isButtonDisabled).to.be.true;
      });
    });

    it('displays warning message when open for review and being viewed by project owner', () => {
      store.dispatch(setHasOpenCodeReview(true));
      store.dispatch(setPageConstants({isViewingOwnProject: true}));

      const editor = createWrapper();

      const banner = editor.find('div#openCodeReviewWarningBanner');
      expect(banner).to.have.lengthOf(1);
      expect(banner.contains(javalabMsg.editingDisabledUnderReview())).to.be
        .true;
    });

    it('does not display warning message if not open for review', () => {
      store.dispatch(setHasOpenCodeReview(false));
      store.dispatch(setPageConstants({isViewingOwnProject: true}));

      const editor = createWrapper();

      expect(editor.find('div#openCodeReviewWarningBanner')).to.have.lengthOf(
        0
      );
    });

    it('displays warning message when viewing a peers project', () => {
      store.dispatch(setHasOpenCodeReview(true));
      store.dispatch(
        setPageConstants({isViewingOwnProject: false, codeOwnersName: 'George'})
      );

      const editor = createWrapper();

      const banner = editor.find('div#openCodeReviewWarningBanner');
      expect(banner).to.have.lengthOf(1);
      expect(
        banner.contains(
          javalabMsg.codeReviewingPeer({
            peerName: 'George',
          })
        )
      ).to.be.true;
    });
  });
});
