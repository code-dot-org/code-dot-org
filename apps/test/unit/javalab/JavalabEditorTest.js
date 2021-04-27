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
import {oneDark} from '@codemirror/theme-one-dark';
import {lightMode} from '@cdo/apps/javalab/editorSetup';
import javalab, {toggleDarkMode} from '@cdo/apps/javalab/javalabRedux';

describe('Java Lab Editor Test', () => {
  let defaultProps, store, appOptions;

  beforeEach(() => {
    stubRedux();
    registerReducers({javalab});
    store = getStore();
    defaultProps = {
      onCommitCode: () => {}
    };
    appOptions = window.appOptions;
    window.appOptions = {level: {}};
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
      expect(editor.find('JavalabEditor').instance().state.showMenu).to.be.true;
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
      expect(editor.find('JavalabEditor').instance().state.contextTarget).to.be
        .null;
    });
  });

  describe('Rename', () => {
    it('updates state on rename save', () => {
      const editor = createWrapper();
      const javalabEditor = editor.find('JavalabEditor').instance();
      const oldFilename = 'MyClass.java'; // default filename
      const newFilename = 'NewFilename.java';

      // should have default file in redux
      expect(store.getState().javalab.sources[oldFilename]).to.not.be.undefined;

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
      expect(store.getState().javalab.sources[newFilename]).to.not.be.undefined;
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
  });

  describe('componentDidUpdate', () => {
    it('toggles between light and dark modes', () => {
      const editor = createWrapper();
      const javalabCodeMirrors = editor.find('JavalabEditor').instance()
        .editors;
      const firstEditor = Object.values(javalabCodeMirrors)[0];

      const dispatchSpy = sinon.spy(firstEditor, 'dispatch');
      store.dispatch(toggleDarkMode());
      expect(dispatchSpy).to.have.been.calledWith({
        reconfigure: {style: oneDark}
      });
      store.dispatch(toggleDarkMode());
      expect(dispatchSpy).to.have.been.calledWith({
        reconfigure: {style: lightMode}
      });
    });
  });

  describe('onOpenFile', () => {
    it('moves the selected tab to the front and selects it', () => {
      const editor = createWrapper();
      const javalabEditor = editor.find('JavalabEditor').instance();
      javalabEditor.setState({
        activeTabKey: 'file-0',
        tabs: [
          {
            filename: 'file0.java',
            key: 'file-0'
          },
          {
            filename: 'file1.java',
            key: 'file-1'
          }
        ],
        showMenu: true,
        contextTarget: 'file-0'
      });
      javalabEditor.onOpenFile('file-1');
      expect(javalabEditor.state.activeTabKey).to.equal('file-1');
      expect(javalabEditor.state.tabs).to.deep.equal([
        {
          filename: 'file1.java',
          key: 'file-1'
        },
        {
          filename: 'file0.java',
          key: 'file-0'
        }
      ]);
      expect(javalabEditor.state.showMenu).to.be.false;
      expect(javalabEditor.state.contextTarget).to.be.null;
    });
  });
});
