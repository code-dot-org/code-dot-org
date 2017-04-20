import sinon from 'sinon';
import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../util/configuredChai';
import ShowCodeToggle from '@cdo/apps/templates/ShowCodeToggle';
import {PaneButton} from '@cdo/apps/templates/PaneHeader';
import {singleton as studioApp, stubStudioApp, restoreStudioApp} from '@cdo/apps/StudioApp';
import LegacyDialog from '@cdo/apps/code-studio/LegacyDialog';
import {registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';

describe('ShowCodeToggle', () => {
  let config, toggle, containerDiv, codeWorkspaceDiv;

  beforeEach(stubStudioApp);
  afterEach(restoreStudioApp);
  beforeEach(() => sinon.stub(LegacyDialog.prototype, 'show'));
  afterEach(() => LegacyDialog.prototype.show.restore());
  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
  });
  afterEach(restoreRedux);

  beforeEach(() => sinon.stub(studioApp(), 'handleEditCode_').callsFake(function () {
    this.editor = {
      currentlyUsingBlocks: true,
      getValue: () => '',
      toggleBlocks() {
        this.currentlyUsingBlocks = !this.currentlyUsingBlocks;
      },
      aceEditor: {
        focus(){},
      },
    };
  }));

  beforeEach(() => {
    config = {
      enableShowCode: true,
      containerId: 'foo',
      level: {
        editCode: true,
        codeFunctions: {},
      },
      dropletConfig: {
        blocks: [],
      },
      skin: {},
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

  describe("when initially mounted", () => {
    beforeEach(() => {
      toggle = mount(
        <ShowCodeToggle onToggle={sinon.spy()}/>
      );
    });

    it("renders a PaneButton with a 'Show Text' label", () => {
      expect(toggle.containsMatchingElement(
        <PaneButton
          id="show-code-header"
          headerHasFocus={false}
          isRtl={false}
          iconClass="fa fa-code"
          label="Show Text"
          style={{display: 'inline-block'}}
        />
      )).to.be.true;
    });

    describe("after being clicked", () => {
      beforeEach(() => toggle.simulate('click'));

      it("renders a 'Show Blocks' label", () => {
        expect(toggle.containsMatchingElement(
          <PaneButton
            id="show-code-header"
            headerHasFocus={false}
            isRtl={false}
            iconClass=""
            label="Show Blocks"
            style={{display: 'inline-block'}}
          />
        )).to.be.true;
      });

      it("makes the editor stop using blocks", () => {
        expect(studioApp().editor.currentlyUsingBlocks).to.be.false;
      });

      describe("and after being clicked again", () => {
        beforeEach(() => toggle.simulate('click'));

        it("will switch back to the way it was", () => {
          expect(toggle.containsMatchingElement(
            <PaneButton
              id="show-code-header"
              headerHasFocus={false}
              isRtl={false}
              iconClass="fa fa-code"
              label="Show Text"
              style={{display: 'inline-block'}}
            />
          )).to.be.true;
        });

        it("will make the editor start using blocks", () => {
          expect(studioApp().editor.currentlyUsingBlocks).to.be.true;
        });
      });
    });
  });


  describe("when passed in an onToggle prop", () => {
    let onToggle;
    beforeEach(() => {
      onToggle = sinon.spy();
      toggle = mount(
        <ShowCodeToggle onToggle={onToggle}/>
      );
    });

    it("will call onToggle with whether or not it is using blocks when it gets clicked", () => {
      toggle.simulate('click');
      expect(onToggle).to.have.been.calledOnce;
      expect(onToggle).to.have.been.calledWith(false);
      toggle.simulate('click');
      expect(onToggle).to.have.been.calledTwice;
      expect(onToggle.secondCall).to.have.been.calledWith(true);
    });
  });

  describe("When studioApp() has been configured with editCode turned off", () => {
    beforeEach(() => {
      studioApp().editCode = false;
      toggle = mount(
        <ShowCodeToggle onToggle={sinon.spy()}/>
      );
    });

    it("will render the button with 'Show Code' instead of 'Show Text'", () => {
      expect(toggle.containsMatchingElement(
        <PaneButton
          id="show-code-header"
          headerHasFocus={false}
          isRtl={false}
          iconClass="fa fa-code"
          label="Show Code"
          style={{display: 'inline-block'}}
        />
      )).to.be.true;
    });

    describe("and the show code button is pressed", () => {
      beforeEach(() => toggle.simulate('click'));
      it("will not call onDropletToggle", () => {
        expect(studioApp().onDropletToggle).not.to.have.been.called;
      });
      it("will instead show the generated code", () => {
        expect(studioApp().showGeneratedCode).to.have.been.called;
      });
    });
  });

  describe("when studioApp() is configured with enableShowCode turned off", () => {
    beforeEach(() => {
      studioApp().enableShowCode = false;
      toggle = mount(
        <ShowCodeToggle onToggle={sinon.spy()}/>
      );
    });

    it("will appear hidden", () => {
      expect(toggle.containsMatchingElement(
        <PaneButton
          id="show-code-header"
          headerHasFocus={false}
          isRtl={false}
          iconClass="fa fa-code"
          label="Show Text"
          style={{display: 'none'}}
        />
      )).to.be.true;
    });
  });

  describe("when studioApp() is initialized again", () => {
    beforeEach(() => {
      toggle = mount(
        <ShowCodeToggle onToggle={sinon.spy()}/>
      );
      config.enableShowCode = false;
      studioApp().init(config);
    });

    it("will reflect the most recent config passed to studioApp().init()", () => {
      expect(toggle.containsMatchingElement(
        <PaneButton
          id="show-code-header"
          headerHasFocus={false}
          isRtl={false}
          iconClass="fa fa-code"
          label="Show Text"
          style={{display: 'none'}}
        />
      )).to.be.true;
    });
  });

});
