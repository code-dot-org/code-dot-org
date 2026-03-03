import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';

import JavalabEditor from '@cdo/apps/javalab/JavalabEditor';
import javalabEditor, {
  setActiveTabKey,
  setAllEditorMetadata,
  setAllSourcesAndFileMetadata,
  setAllValidation,
} from '@cdo/apps/javalab/redux/editorRedux';
import javalab, {
  setIsReadOnlyWorkspace,
  setHasOpenCodeReview,
  setBackpackEnabled,
} from '@cdo/apps/javalab/redux/javalabRedux';
import javalabView from '@cdo/apps/javalab/redux/viewRedux';
import {JavalabEditorDialog} from '@cdo/apps/javalab/types';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import {BackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import javalabMsg from '@cdo/javalab/locale';
import i18n from '@cdo/locale';

describe('Java Lab Editor Test', () => {
  let defaultProps, store, appOptions, mockBackpackApi;

  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
    registerReducers({javalab, javalabEditor, javalabView});
    store = getStore();
    defaultProps = {
      onCommitCode: jest.fn(),
      showProjectTemplateWorkspaceIcon: false,
      isProjectTemplateLevel: false,
      height: 400,
      handleClearPuzzle: jest.fn(),
    };
    appOptions = window.appOptions;
    window.appOptions = {level: {}};
    store.dispatch(
      setPageConstants({
        isEditingStartSources: false,
      })
    );

    mockBackpackApi = {
      hasBackpack: jest.fn().mockReturnValue(true),
      getFileList: jest.fn((_, successCb) => successCb(['backpackFile.java'])),
      fetchFile: jest.fn(),
      deleteFiles: jest.fn(),
    };

    store.dispatch(setBackpackEnabled(true));
  });

  afterEach(() => {
    restoreRedux();
    window.appOptions = appOptions;
  });

  const renderComponent = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return render(
      <Provider store={store}>
        <BackpackAPIContext.Provider value={mockBackpackApi}>
          <JavalabEditor {...combinedProps} />
        </BackpackAPIContext.Provider>
      </Provider>
    );
  };

  describe('Editing Mode', () => {
    beforeEach(() => {
      store.dispatch(setIsReadOnlyWorkspace(false));
    });

    describe('toggleTabMenu', () => {
      it('Opens the menu after clicking on a tab if it is not open', async () => {
        renderComponent();
        const user = userEvent.setup();
        await user.click(
          screen.getByRole('button', {name: i18n.fileOptions()})
        );
        expect(
          screen.getByRole('button', {name: javalabMsg.rename()})
        ).toBeInTheDocument();
      });

      it('Closes the tab menu when Escape is pressed', async () => {
        renderComponent();
        const user = userEvent.setup();
        const toggleButton = screen.getByRole('button', {
          name: i18n.fileOptions(),
        });
        await user.click(toggleButton); // open
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
        await user.keyboard('{Escape}'); // close via CloseOnEscape
        expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    describe('Rename', () => {
      it('updates state and sources on rename save', async () => {
        const user = userEvent.setup();
        const oldFilename = 'MyClass.java'; // default filename
        const newFilename = 'NewFilename.java';

        store.dispatch(
          setAllSourcesAndFileMetadata({
            [oldFilename]: {
              text: '',
              tabOrder: 0,
              isVisible: true,
              isValidation: false,
            },
            'AnotherClass.java': {
              text: '',
              tabOrder: 1,
              isVisible: true,
              isValidation: false,
            },
          })
        );
        renderComponent();

        // Should have default file in Redux
        expect(
          store.getState().javalabEditor.sources[oldFilename]
        ).toBeDefined();

        // Open file options for the active tab, then click Rename
        await user.click(
          screen.getByRole('button', {name: i18n.fileOptions()})
        );
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.rename()})
        );

        // Type new filename in dialog
        const input = await screen.findByDisplayValue('MyClass.java');
        await user.clear(input);
        await user.type(input, newFilename);
        await user.click(
          screen.getByRole('button', {name: javalabMsg.rename()})
        );

        expect(
          store.getState().javalabEditor.sources[newFilename]
        ).toBeDefined();
        expect(
          store.getState().javalabEditor.sources[oldFilename]
        ).toBeUndefined();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBeNull();
        expect(store.getState().javalabEditor.renameFileError).toBeNull();
        expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
          'file-0',
          'file-1',
        ]);
        expect(store.getState().javalabEditor.fileMetadata).toEqual({
          'file-0': newFilename,
          'file-1': 'AnotherClass.java',
        });
      });

      it('displays error message on a naming collision', async () => {
        const user = userEvent.setup();
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
        renderComponent();

        // Open rename dialog for the active tab (Class1.java)
        await user.click(
          screen.getByRole('button', {name: i18n.fileOptions()})
        );
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.rename()})
        );

        // Try to rename to existing filename
        const input = await screen.findByDisplayValue('Class1.java');
        await user.clear(input);
        await user.type(input, 'Class2.java');
        await user.click(
          screen.getByRole('button', {name: javalabMsg.rename()})
        );

        // Error shown, dialog stays open, no changes to files
        expect(store.getState().javalabEditor.renameFileError).toBeTruthy();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBe(
          JavalabEditorDialog.RENAME_FILE
        );
        expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
          'file-0',
          'file-1',
        ]);
        expect(store.getState().javalabEditor.fileMetadata).toEqual({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
        });
      });

      it('displays error message on a validation naming collision', async () => {
        const user = userEvent.setup();
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
        renderComponent();

        // Open rename dialog for Class1.java
        await user.click(
          screen.getByRole('button', {name: i18n.fileOptions()})
        );
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.rename()})
        );

        // Try to rename to a validation file name
        const input = await screen.findByDisplayValue('Class1.java');
        await user.clear(input);
        await user.type(input, 'Validation.java');
        await user.click(
          screen.getByRole('button', {name: javalabMsg.rename()})
        );

        expect(store.getState().javalabEditor.renameFileError).toBeTruthy();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBe(
          JavalabEditorDialog.RENAME_FILE
        );
        expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
          'file-0',
        ]);
        expect(store.getState().javalabEditor.fileMetadata).toEqual({
          'file-0': 'Class1.java',
        });
      });

      it('displays error message if file name is blank', async () => {
        const user = userEvent.setup();
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
        renderComponent();

        // Open rename dialog
        await user.click(
          screen.getByRole('button', {name: i18n.fileOptions()})
        );
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.rename()})
        );

        // Submit empty filename
        const input = await screen.findByDisplayValue('Class1.java');
        await user.clear(input);
        await user.click(
          screen.getByRole('button', {name: javalabMsg.rename()})
        );

        expect(store.getState().javalabEditor.renameFileError).toBeTruthy();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBe(
          JavalabEditorDialog.RENAME_FILE
        );
        expect(store.getState().javalabEditor.fileMetadata).toEqual({
          'file-0': 'Class1.java',
        });
      });

      it('displays error message if file name is an invalid java file name', async () => {
        const user = userEvent.setup();
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
        renderComponent();

        // Open rename dialog
        await user.click(
          screen.getByRole('button', {name: i18n.fileOptions()})
        );
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.rename()})
        );

        // Submit invalid filename (spaces)
        const input = await screen.findByDisplayValue('Class1.java');
        await user.clear(input);
        await user.type(input, 'an invalid file name .java');
        await user.click(
          screen.getByRole('button', {name: javalabMsg.rename()})
        );

        expect(store.getState().javalabEditor.renameFileError).toBeTruthy();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBe(
          JavalabEditorDialog.RENAME_FILE
        );
        expect(store.getState().javalabEditor.fileMetadata).toEqual({
          'file-0': 'Class1.java',
        });
      });
    });

    describe('onOpenFile', () => {
      it('moves the selected tab to the front and selects it', async () => {
        const user = userEvent.setup();
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
        renderComponent();

        // Open file explorer and click Class2.java
        await user.click(
          screen.getByRole('button', {name: i18n.fileExplorer()})
        );
        await user.click(
          await screen.findByRole('button', {name: 'Class2.java'})
        );

        expect(store.getState().javalabEditor.activeTabKey).toBe('file-1');
        expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
          'file-1',
          'file-0',
        ]);
      });
    });

    describe('Moving file tabs', () => {
      describe('When there are 3 or more tabs in Java Lab editor', () => {
        beforeEach(() => {
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

        it('When moveTabLeft is called, activeTab is swapped with tab to the left', async () => {
          // Set active tab to the middle file
          store.dispatch(setActiveTabKey('file-1'));
          renderComponent();
          const user = userEvent.setup();

          await user.click(
            screen.getByRole('button', {name: i18n.fileOptions()})
          );
          await user.click(
            await screen.findByRole('button', {name: javalabMsg.moveLeft()})
          );

          expect(store.getState().javalabEditor.activeTabKey).toBe('file-1');
          expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
            'file-1',
            'file-0',
            'file-2',
          ]);
        });

        it('When moveTabRight is called, activeTab is swapped with tab to the right', async () => {
          // Set active tab to the middle file
          store.dispatch(setActiveTabKey('file-1'));
          renderComponent();
          const user = userEvent.setup();

          await user.click(
            screen.getByRole('button', {name: i18n.fileOptions()})
          );
          await user.click(
            await screen.findByRole('button', {name: javalabMsg.moveRight()})
          );

          expect(store.getState().javalabEditor.activeTabKey).toBe('file-1');
          expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
            'file-0',
            'file-2',
            'file-1',
          ]);
        });

        it('When moveTabLeft is called and activeTab is leftmost tab, no change occurs', async () => {
          // Active tab is file-0 (leftmost) by default
          renderComponent();
          const user = userEvent.setup();

          await user.click(
            screen.getByRole('button', {name: i18n.fileOptions()})
          );
          // Only "Move Right" is available for leftmost tab; "Move Left" should not exist
          expect(
            screen.queryByRole('button', {name: javalabMsg.moveLeft()})
          ).not.toBeInTheDocument();
          expect(store.getState().javalabEditor.activeTabKey).toBe('file-0');
          expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
            'file-0',
            'file-1',
            'file-2',
          ]);
        });

        it('When moveTabRight is called and activeTab is rightmost tab, no change occurs', async () => {
          // Set active tab to the rightmost file
          store.dispatch(setActiveTabKey('file-2'));
          renderComponent();
          const user = userEvent.setup();

          await user.click(
            screen.getByRole('button', {name: i18n.fileOptions()})
          );
          // Only "Move Left" is available for rightmost tab; "Move Right" should not exist
          expect(
            screen.queryByRole('button', {name: javalabMsg.moveRight()})
          ).not.toBeInTheDocument();
          expect(store.getState().javalabEditor.activeTabKey).toBe('file-2');
          expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
            'file-0',
            'file-1',
            'file-2',
          ]);
        });
      });

      describe('When there is only one tab in Java Lab editor', () => {
        it('When moveTabRight and moveTabLeft are called and there is only one file, no change occurs', async () => {
          // Default state has one file (MyClass.java as file-0)
          renderComponent();
          const user = userEvent.setup();

          await user.click(
            screen.getByRole('button', {name: i18n.fileOptions()})
          );
          // Neither Move Left nor Move Right is available for a single tab
          expect(
            screen.queryByRole('button', {name: javalabMsg.moveLeft()})
          ).not.toBeInTheDocument();
          expect(
            screen.queryByRole('button', {name: javalabMsg.moveRight()})
          ).not.toBeInTheDocument();

          expect(store.getState().javalabEditor.activeTabKey).toBe('file-0');
          expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
            'file-0',
          ]);
        });
      });
    });

    describe('Create New File', () => {
      it('updates state and sources on create save', async () => {
        const user = userEvent.setup();
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
        renderComponent();

        // Click "New File" button in header
        await user.click(
          screen.getByRole('button', {name: javalabMsg.newFile()})
        );

        const newFilename = 'Class3.java';
        const input = await screen.findByDisplayValue('.java');
        await user.clear(input);
        await user.type(input, newFilename);
        await user.click(
          screen.getByRole('button', {name: javalabMsg.create()})
        );

        expect(
          store.getState().javalabEditor.sources[newFilename]
        ).toBeDefined();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBeNull();
        expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
          'file-0',
          'file-1',
          'file-2',
        ]);
        expect(store.getState().javalabEditor.fileMetadata).toEqual({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
          'file-2': newFilename,
        });
      });

      it('displays error message on a naming collision', async () => {
        const user = userEvent.setup();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {text: '', isVisible: true, isValidation: false},
            'Class2.java': {text: '', isVisible: true, isValidation: false},
          })
        );
        renderComponent();

        await user.click(
          screen.getByRole('button', {name: javalabMsg.newFile()})
        );

        const input = await screen.findByDisplayValue('.java');
        await user.clear(input);
        await user.type(input, 'Class2.java');
        await user.click(
          screen.getByRole('button', {name: javalabMsg.create()})
        );

        expect(store.getState().javalabEditor.newFileError).toBeTruthy();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBe(
          JavalabEditorDialog.CREATE_FILE
        );
        expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
          'file-0',
          'file-1',
        ]);
        expect(store.getState().javalabEditor.fileMetadata).toEqual({
          'file-0': 'Class1.java',
          'file-1': 'Class2.java',
        });
      });

      it('displays error message on a validation naming collision', async () => {
        const user = userEvent.setup();
        store.dispatch(
          setAllValidation({
            'Validation.java': {
              text: '',
              isVisible: false,
              isValidation: true,
            },
          })
        );
        store.dispatch(setAllEditorMetadata({}, [], null, 0));
        renderComponent();

        await user.click(
          screen.getByRole('button', {name: javalabMsg.newFile()})
        );

        const input = await screen.findByRole('textbox');
        await user.clear(input);
        await user.type(input, 'Validation.java');
        await user.click(
          screen.getByRole('button', {name: javalabMsg.create()})
        );

        expect(store.getState().javalabEditor.newFileError).toBeTruthy();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBe(
          JavalabEditorDialog.CREATE_FILE
        );
        expect(store.getState().javalabEditor.orderedTabKeys).toEqual([]);
        expect(store.getState().javalabEditor.fileMetadata).toEqual({});
      });

      it('displays error message if file name is blank', async () => {
        const user = userEvent.setup();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {text: '', isVisible: true, isValidation: false},
          })
        );
        renderComponent();

        await user.click(
          screen.getByRole('button', {name: javalabMsg.newFile()})
        );

        const input = await screen.findByDisplayValue('.java');
        await user.clear(input);
        await user.click(
          screen.getByRole('button', {name: javalabMsg.create()})
        );

        expect(store.getState().javalabEditor.newFileError).toBeTruthy();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBe(
          JavalabEditorDialog.CREATE_FILE
        );
        expect(store.getState().javalabEditor.fileMetadata).toEqual({
          'file-0': 'Class1.java',
        });
      });

      it('displays error message if file name is an invalid java file name', async () => {
        const user = userEvent.setup();
        store.dispatch(
          setAllSourcesAndFileMetadata({
            'Class1.java': {text: '', isVisible: true, isValidation: false},
          })
        );
        renderComponent();

        await user.click(
          screen.getByRole('button', {name: javalabMsg.newFile()})
        );

        const input = await screen.findByDisplayValue('.java');
        await user.clear(input);
        await user.type(input, 'an invalid file name .java');
        await user.click(
          screen.getByRole('button', {name: javalabMsg.create()})
        );

        expect(store.getState().javalabEditor.newFileError).toBeTruthy();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBe(
          JavalabEditorDialog.CREATE_FILE
        );
        expect(store.getState().javalabEditor.fileMetadata).toEqual({
          'file-0': 'Class1.java',
        });
      });
    });

    describe('Delete File', () => {
      it('updates state and sources on delete save', async () => {
        const user = userEvent.setup();
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
        renderComponent();

        // Open file options menu and click Delete
        await user.click(
          screen.getByRole('button', {name: i18n.fileOptions()})
        );
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.delete()})
        );

        // Confirm deletion in the dialog (tab menu is now hidden)
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.delete()})
        );

        expect(
          store.getState().javalabEditor.sources['Class1.java']
        ).toBeUndefined();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBeNull();
        expect(store.getState().javalabEditor.orderedTabKeys).toEqual([
          'file-1',
        ]);
        expect(store.getState().javalabEditor.fileMetadata).toEqual({
          'file-1': 'Class2.java',
        });
      });

      it('can delete the only file in the editor', async () => {
        const user = userEvent.setup();
        // Default state has one file (MyClass.java as file-0)
        renderComponent();

        await user.click(
          screen.getByRole('button', {name: i18n.fileOptions()})
        );
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.delete()})
        );
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.delete()})
        );

        expect(
          store.getState().javalabEditor.sources['MyClass.java']
        ).toBeUndefined();
        expect(store.getState().javalabEditor.editorOpenDialogName).toBeNull();
        expect(store.getState().javalabEditor.activeTabKey).toBeNull();
        expect(store.getState().javalabEditor.orderedTabKeys).toEqual([]);
        expect(store.getState().javalabEditor.fileMetadata).toEqual({});
      });

      it('updates sources when file is deleted', async () => {
        const user = userEvent.setup();
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
        renderComponent();

        // Delete the active file (file-0 = ClassName1.java)
        await user.click(
          screen.getByRole('button', {name: i18n.fileOptions()})
        );
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.delete()})
        );
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.delete()})
        );

        const sources = store.getState().javalabEditor.sources;
        expect(sources['ClassName1.java']).toBeUndefined();
        expect(sources['ClassName2.java'].tabOrder).toBe(0);
        expect(sources['ClassName3.java'].tabOrder).toBe(1);
      });
    });

    describe('Import File', () => {
      it('can overwrite an existing file', async () => {
        const user = userEvent.setup();
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

        // Mock backpack to return Class1.java with new content
        mockBackpackApi.getFileList.mockImplementation((_, successCb) =>
          successCb(['Class1.java'])
        );
        mockBackpackApi.fetchFile.mockImplementation((_, _errCb, successCb) =>
          successCb(newText)
        );

        renderComponent();

        // Open backpack dropdown, select file, and import
        await user.click(
          screen.getByRole('button', {name: javalabMsg.backpackLabel()})
        );
        await user.click(
          await screen.findByRole('checkbox', {name: 'Class1.java'})
        );
        await user.click(
          screen.getByRole('button', {name: javalabMsg.import()})
        );

        // Confirm replacing the existing file
        await user.click(
          await screen.findByRole('button', {name: javalabMsg.replace()})
        );

        expect(store.getState().javalabEditor.sources['Class1.java'].text).toBe(
          newText
        );
        expect(store.getState().javalabEditor.orderedTabKeys).toHaveLength(2);
      });

      it('can create a new file', async () => {
        const user = userEvent.setup();
        const newText = 'hello';

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

        // Mock backpack to return a file not already in the project
        mockBackpackApi.getFileList.mockImplementation((_, successCb) =>
          successCb(['Class3.java'])
        );
        mockBackpackApi.fetchFile.mockImplementation((_, _errCb, successCb) =>
          successCb(newText)
        );

        renderComponent();

        // Open backpack dropdown, select new file, and import (no conflict warning)
        await user.click(
          screen.getByRole('button', {name: javalabMsg.backpackLabel()})
        );
        await user.click(await screen.findByLabelText('Class3.java'));
        await user.click(
          screen.getByRole('button', {name: javalabMsg.import()})
        );

        expect(store.getState().javalabEditor.sources['Class3.java'].text).toBe(
          newText
        );
        expect(store.getState().javalabEditor.orderedTabKeys).toHaveLength(3);
      });
    });

    it('is editable', () => {
      renderComponent();
      // CodeMirror 6 renders a div with role="textbox" and contenteditable
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'contenteditable',
        'true'
      );
    });

    it('header buttons are enabled', () => {
      renderComponent();
      expect(
        screen.getByRole('button', {name: javalabMsg.newFile()})
      ).not.toBeDisabled();
      expect(
        screen.getByRole('button', {name: i18n.showVersionsHeader()})
      ).not.toBeDisabled();
      expect(
        screen.getByRole('button', {name: javalabMsg.commitCode()})
      ).not.toBeDisabled();
      expect(
        screen.getByRole('button', {name: javalabMsg.backpackLabel()})
      ).not.toBeDisabled();
    });

    it('hides backpack button if disabled', () => {
      store.dispatch(setBackpackEnabled(false));
      renderComponent();
      expect(
        screen.queryByRole('button', {name: javalabMsg.backpackLabel()})
      ).not.toBeInTheDocument();
    });

    it('does not display code review readonly banner', () => {
      renderComponent();
      expect(
        screen.queryByText(javalabMsg.editingDisabledUnderReview())
      ).not.toBeInTheDocument();
    });
  });

  describe('View Only Mode', () => {
    beforeEach(() => {
      store.dispatch(setIsReadOnlyWorkspace(true));
    });

    it('is not editable', () => {
      renderComponent();
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'contenteditable',
        'false'
      );
    });

    it('header buttons are disabled', () => {
      renderComponent();
      expect(
        screen.getByRole('button', {name: javalabMsg.newFile()})
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {name: i18n.showVersionsHeader()})
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {name: javalabMsg.commitCode()})
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {name: javalabMsg.backpackLabel()})
      ).toBeDisabled();
    });

    it('displays warning message when open for review and being viewed by project owner', () => {
      store.dispatch(setHasOpenCodeReview(true));
      store.dispatch(setPageConstants({isViewingOwnProject: true}));

      renderComponent();

      expect(
        screen.getByText(javalabMsg.editingDisabledUnderReview())
      ).toBeInTheDocument();
    });

    it('does not display warning message if not open for review', () => {
      store.dispatch(setHasOpenCodeReview(false));
      store.dispatch(setPageConstants({isViewingOwnProject: true}));

      renderComponent();

      expect(
        screen.queryByText(javalabMsg.editingDisabledUnderReview())
      ).not.toBeInTheDocument();
    });

    it('displays warning message when viewing a peers project', () => {
      store.dispatch(setHasOpenCodeReview(true));
      store.dispatch(
        setPageConstants({isViewingOwnProject: false, codeOwnersName: 'George'})
      );

      renderComponent();

      expect(
        screen.getByText(javalabMsg.codeReviewingPeer({peerName: 'George'}))
      ).toBeInTheDocument();
    });
  });
});
