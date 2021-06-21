import $ from 'jquery';
import sinon from 'sinon';
import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import ShowCodeToggle from '@cdo/apps/templates/ShowCodeToggle';
import {PaneButton} from '@cdo/apps/templates/PaneHeader';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp
} from '@cdo/apps/StudioApp';
import LegacyDialog from '@cdo/apps/code-studio/LegacyDialog';
import {registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import project from '@cdo/apps/code-studio/initApp/project';
import {
  allowConsoleErrors,
  allowConsoleWarnings
} from '../../util/throwOnConsole';

describe('The ShowCodeToggle component', () => {
  allowConsoleErrors();
  allowConsoleWarnings();

  let config, toggle, containerDiv, codeWorkspaceDiv, server, editor;

  beforeEach(() => {
    server = sinon.fakeServerWithClock.create();
    sinon.spy($, 'post');
    sinon.spy($, 'getJSON');
    sinon.stub(project, 'getCurrentId').returns('some-project-id');
  });
  afterEach(() => {
    server.restore();
    $.post.restore();
    $.getJSON.restore();
    project.getCurrentId.restore();
  });

  beforeEach(stubStudioApp);
  afterEach(restoreStudioApp);
  beforeEach(() => sinon.stub(LegacyDialog.prototype, 'show'));
  afterEach(() => LegacyDialog.prototype.show.restore());
  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
  });
  afterEach(restoreRedux);

  beforeEach(() => {
    editor = {
      session: {
        currentlyUsingBlocks: true
      },
      getValue: () => '',
      toggleBlocks() {
        this.session.currentlyUsingBlocks = !this.session.currentlyUsingBlocks;
      },
      aceEditor: {
        focus() {}
      }
    };
    sinon.stub(studioApp(), 'handleEditCode_').callsFake(function() {
      this.editor = editor;
    });
  });

  beforeEach(() => {
    config = {
      enableShowCode: true,
      containerId: 'foo',
      level: {
        id: 'some-level-id',
        editCode: true,
        codeFunctions: {}
      },
      dropletConfig: {
        blocks: []
      },
      skin: {}
    };

    codeWorkspaceDiv = document.createElement('div');
    codeWorkspaceDiv.id = 'codeWorkspace';
    document.body.appendChild(codeWorkspaceDiv);

    containerDiv = document.createElement('div');
    containerDiv.id = config.containerId;
    containerDiv.innerHTML = `
<button id="runButton" />
<button id="resetButton" />
<div id="visualizationColumn" />
<div id="toolbox-header" />
`;
    document.body.appendChild(containerDiv);

    studioApp().configure(config);
    studioApp().init(config);
  });

  afterEach(() => {
    document.body.removeChild(codeWorkspaceDiv);
    document.body.removeChild(containerDiv);
  });

  beforeEach(() => sinon.stub(studioApp(), 'onDropletToggle'));

  beforeEach(() => sinon.stub(studioApp(), 'showGeneratedCode'));

  describe('when the studioApp editor has currentlyUsingBlocks=false', () => {
    beforeEach(() => {
      editor.session.currentlyUsingBlocks = false;
      toggle = mount(<ShowCodeToggle onToggle={sinon.spy()} />);
      studioApp().init(config);
    });

    it("will render with the 'Show Blocks' label", () => {
      expect(
        toggle.containsMatchingElement(
          <PaneButton
            id="show-code-header"
            headerHasFocus={false}
            isRtl={false}
            iconClass=""
            label="Show Blocks"
            style={{display: 'inline-block'}}
          />
        )
      ).to.be.true;
    });
  });

  describe('when initially mounted', () => {
    beforeEach(() => {
      toggle = mount(<ShowCodeToggle onToggle={sinon.spy()} />);
    });

    it("renders a PaneButton with a 'Show Text' label", () => {
      expect(
        toggle.containsMatchingElement(
          <PaneButton
            id="show-code-header"
            headerHasFocus={false}
            isRtl={false}
            iconClass="fa fa-code"
            label="Show Text"
            style={{display: 'inline-block'}}
          />
        )
      ).to.be.true;
    });

    describe('after being clicked', () => {
      beforeEach(() => toggle.simulate('click'));

      it("renders a 'Show Blocks' label", () => {
        expect(
          toggle.containsMatchingElement(
            <PaneButton
              id="show-code-header"
              headerHasFocus={false}
              isRtl={false}
              iconClass=""
              label="Show Blocks"
              style={{display: 'inline-block'}}
            />
          )
        ).to.be.true;
      });

      it('makes the editor stop using blocks', () => {
        expect(studioApp().editor.session.currentlyUsingBlocks).to.be.false;
      });

      it("saves the text mode setting to the user's preferences", () => {
        expect($.post).to.have.been.calledWith(
          '/api/v1/users/me/using_text_mode',
          {
            project_id: 'some-project-id',
            level_id: 'some-level-id',
            using_text_mode: true
          }
        );
      });

      describe('and after being clicked again', () => {
        beforeEach(() => toggle.simulate('click'));

        it('will switch back to the way it was', () => {
          expect(
            toggle.containsMatchingElement(
              <PaneButton
                id="show-code-header"
                headerHasFocus={false}
                isRtl={false}
                iconClass="fa fa-code"
                label="Show Text"
                style={{display: 'inline-block'}}
              />
            )
          ).to.be.true;
        });

        it('will make the editor start using blocks', () => {
          expect(studioApp().editor.session.currentlyUsingBlocks).to.be.true;
        });

        it("save the text mode setting to the user's preferences again", () => {
          expect($.post).to.have.been.calledWith(
            '/api/v1/users/me/using_text_mode',
            {
              level_id: 'some-level-id',
              project_id: 'some-project-id',
              using_text_mode: false
            }
          );
        });
      });
    });
  });

  describe('when passed in an onToggle prop', () => {
    let onToggle;
    beforeEach(() => {
      onToggle = sinon.spy();
      toggle = mount(<ShowCodeToggle onToggle={onToggle} />);
    });

    it('will call onToggle with whether or not it is using blocks when it gets clicked', () => {
      toggle.simulate('click');
      expect(onToggle).to.have.been.calledOnce;
      expect(onToggle).to.have.been.calledWith(false);
      toggle.simulate('click');
      expect(onToggle).to.have.been.calledTwice;
      expect(onToggle.secondCall).to.have.been.calledWith(true);
    });
  });

  describe('When studioApp() has been configured with editCode turned off', () => {
    beforeEach(() => {
      studioApp().editCode = false;
      toggle = mount(<ShowCodeToggle onToggle={sinon.spy()} />);
    });

    it("will render the button with 'Show Code' instead of 'Show Text'", () => {
      expect(
        toggle.containsMatchingElement(
          <PaneButton
            id="show-code-header"
            headerHasFocus={false}
            isRtl={false}
            iconClass="fa fa-code"
            label="Show Code"
            style={{display: 'inline-block'}}
          />
        )
      ).to.be.true;
    });

    describe('and the show code button is pressed', () => {
      beforeEach(() => toggle.simulate('click'));
      it('will not call onDropletToggle', () => {
        expect(studioApp().onDropletToggle).not.to.have.been.called;
      });
      it('will instead show the generated code', () => {
        expect(studioApp().showGeneratedCode).to.have.been.called;
      });
    });

    describe('And studioApp() is subsequently initialized with enableShowCode turned off', () => {
      beforeEach(() => {
        config.enableShowCode = false;
        studioApp().init(config);
        toggle.update();
      });
      it('will reflect the most recent config passed to studioApp().init()', () => {
        expect(
          toggle.containsMatchingElement(
            <PaneButton
              id="show-code-header"
              headerHasFocus={false}
              isRtl={false}
              iconClass="fa fa-code"
              label="Show Code"
              style={{display: 'none'}}
            />
          )
        ).to.be.true;
      });
    });
  });

  describe('when studioApp() is configured with enableShowCode turned off', () => {
    beforeEach(() => {
      studioApp().enableShowCode = false;
      toggle = mount(<ShowCodeToggle onToggle={sinon.spy()} />);
    });

    it('will appear hidden', () => {
      expect(
        toggle.containsMatchingElement(
          <PaneButton
            id="show-code-header"
            headerHasFocus={false}
            isRtl={false}
            iconClass="fa fa-code"
            label="Show Text"
            style={{display: 'none'}}
          />
        )
      ).to.be.true;
    });
  });

  describe('when studioApp() is initialized with enableShowCode=false, after the component has been mounted', () => {
    beforeEach(() => {
      toggle = mount(<ShowCodeToggle onToggle={sinon.spy()} />);
      config.enableShowCode = false;
      studioApp().init(config);
      toggle.update();
    });

    it('will reflect the most recent config passed to studioApp().init(). i.e. it will be hidden', () => {
      expect(
        toggle.containsMatchingElement(
          <PaneButton
            id="show-code-header"
            headerHasFocus={false}
            isRtl={false}
            iconClass="fa fa-code"
            label="Show Text"
            style={{display: 'none'}}
          />
        )
      ).to.be.true;
    });
  });
});
