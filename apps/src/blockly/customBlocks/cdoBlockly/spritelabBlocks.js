// This file contains customizations to CDO Blockly Sprite Lab blocks.
import i18n from '@cdo/locale';

export const blocks = {
  // Called by block_utils when creating Sprite Lab blocks with mini-toolboxes.
  initializeMiniToolbox(miniToolboxBlocks) {
    {
      var toggle = new Blockly.FieldIcon('+');
      if (Blockly.cdoUtils.isWorkspaceReadOnly(this.blockSpace)) {
        toggle.setReadOnly();
      }
      var miniToolboxXml = '<xml>';
      miniToolboxBlocks.forEach(block => {
        miniToolboxXml += `\n <block type="${block}"></block>`;
      });
      miniToolboxXml += '\n</xml>';
      // Block.isMiniFlyoutOpen is used in the blockly repo to track whether or not the horizontal flyout is open.
      this.isMiniFlyoutOpen = false;
      // On button click, open/close the horizontal flyout, toggle button text between +/-, and re-render the block.
      Blockly.cdoUtils.bindBrowserEvent(
        toggle.fieldGroup_,
        'mousedown',
        this,
        () => {
          if (Blockly.cdoUtils.isWorkspaceReadOnly(this.blockSpace)) {
            return;
          }
          if (this.isMiniFlyoutOpen) {
            toggle.setValue('+');
          } else {
            toggle.setValue('-');
          }
          this.isMiniFlyoutOpen = !this.isMiniFlyoutOpen;
          this.render();
          // If the mini flyout just opened, make sure mini-toolbox blocks are updated with the right thumbnails.
          // This has to happen after render() because some browsers don't render properly if the elements are not
          // visible. The root cause is that getComputedTextLength returns 0 if a text element is not visible, so
          // the thumbnail image overlaps the label in Firefox, Edge, and IE.
          if (this.isMiniFlyoutOpen) {
            let miniToolboxBlocks = this.miniFlyout.blockSpace_.topBlocks_;
            let rootInputBlocks = this.getConnections_(true /* all */)
              .filter(function (connection) {
                return connection.type === Blockly.INPUT_VALUE;
              })
              .map(function (connection) {
                return connection.targetBlock();
              });
            miniToolboxBlocks.forEach(function (block, index) {
              block.shadowBlockValue_(rootInputBlocks[index]);
            });
          }
        }
      );
      this.appendDummyInput().appendField(toggle, 'toggle').appendField(' ');
      this.initMiniFlyout(miniToolboxXml);
    }
  },
  // All of the work to create the flyout is handled by initializeMiniToolbox
  // This is just needed by block_utils when using the Google Blockly Wrapper.
  appendMiniToolboxToggle() {},

  // Set up this block to shadow an image source block's image, if needed.
  setUpBlockShadowing() {
    switch (this.type) {
      case 'gamelab_clickedSpritePointer':
        this.setBlockToShadow(
          root =>
            root.type === 'gamelab_spriteClicked' &&
            root.getConnections_()[1] &&
            root.getConnections_()[1].targetBlock()
        );
        break;
      case 'gamelab_newSpritePointer':
        this.setBlockToShadow(
          root =>
            root.type === 'gamelab_whenSpriteCreated' &&
            root.getConnections_()[1] &&
            root.getConnections_()[1].targetBlock()
        );
        break;
      case 'gamelab_subjectSpritePointer':
        this.setBlockToShadow(
          root =>
            root.type === 'gamelab_checkTouching' &&
            root.getConnections_()[1] &&
            root.getConnections_()[1].targetBlock()
        );
        break;
      case 'gamelab_objectSpritePointer':
        this.setBlockToShadow(
          root =>
            root.type === 'gamelab_checkTouching' &&
            root.getConnections_()[2] &&
            root.getConnections_()[2].targetBlock()
        );
        break;
      default:
        // Not a pointer block, so no block to shadow
        break;
    }
  },

  installBehaviorBlocks(behaviorEditor) {
    const generator = Blockly.getGenerator();
    Blockly.Blocks.gamelab_behavior_get = {
      init() {
        var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
        // Must be marked EDITABLE so that cloned blocks share the same var name
        fieldLabel.EDITABLE = true;
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        Blockly.cdoUtils.setHSV(this, 136, 0.84, 0.8);
        const mainTitle = this.appendDummyInput()
          .appendField(fieldLabel, 'VAR')
          .appendField(Blockly.Msg.VARIABLES_GET_TAIL);

        let allowBehaviorEditing = Blockly.useModalFunctionEditor;

        // If there is a toolbox with no categories and the level allows editing
        // blocks, disallow editing the behavior, because renaming the behavior
        // can break things.
        if (
          window.appOptions && // global appOptions is not available on level edit page
          appOptions.level.toolbox &&
          !appOptions.readonlyWorkspace &&
          !Blockly.hasCategories
        ) {
          allowBehaviorEditing = false;
        }

        if (allowBehaviorEditing) {
          var editLabel = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
          Blockly.cdoUtils.bindBrowserEvent(
            editLabel.fieldGroup_,
            'mousedown',
            this,
            this.openEditor
          );
          mainTitle.appendField(editLabel);
        }

        this.setStrictOutput(true, Blockly.BlockValueType.BEHAVIOR);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        this.currentParameterNames_ = [];
      },

      openEditor(e) {
        e.stopPropagation();
        behaviorEditor.openEditorForFunction(this, this.getTitle_('VAR').id);
      },

      getVars() {
        return {};
      },

      renameVar(oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
        }
      },

      renameProcedure(oldName, newName, userCreated) {
        if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
          this.setTitleValue(newName, 'VAR');
          if (userCreated) {
            this.getTitle_('VAR').id = newName;
          }
        }
      },

      getCallName() {
        return this.getFieldValue('VAR');
      },

      setProcedureParameters(paramNames, paramIds, typeNames) {
        Blockly.Blocks.procedures_callnoreturn.setProcedureParameters.call(
          this,
          paramNames.slice(1),
          paramIds && paramIds.slice(1),
          typeNames && typeNames.slice(1)
        );
      },

      mutationToDom() {
        const container = document.createElement('mutation');
        for (let x = 0; x < this.currentParameterNames_.length; x++) {
          const parameter = document.createElement('arg');
          parameter.setAttribute('name', this.currentParameterNames_[x]);
          if (this.currentParameterTypes_[x]) {
            parameter.setAttribute('type', this.currentParameterTypes_[x]);
          }
          container.appendChild(parameter);
        }
        return container;
      },

      domToMutation(xmlElement) {
        this.currentParameterNames_ = [];
        this.currentParameterTypes_ = [];
        for (let childNode of xmlElement.childNodes) {
          if (childNode.nodeName.toLowerCase() === 'arg') {
            this.currentParameterNames_.push(childNode.getAttribute('name'));
            this.currentParameterTypes_.push(childNode.getAttribute('type'));
          }
        }
        // Use parameter names as dummy IDs during initialization. Add dummy
        // "this_sprite" param.
        this.setProcedureParameters(
          [null].concat(this.currentParameterNames_),
          [null].concat(this.currentParameterNames_),
          [null].concat(this.currentParameterTypes_)
        );
      },
    };

    generator.gamelab_behavior_get = function () {
      const name = Blockly.JavaScript.variableDB_.getName(
        this.getTitle_('VAR').id,
        Blockly.Procedures.NAME_TYPE
      );
      const extraArgs = [];
      for (let x = 0; x < this.currentParameterNames_.length; x++) {
        extraArgs[x] =
          Blockly.JavaScript.valueToCode(
            this,
            'ARG' + x,
            Blockly.JavaScript.ORDER_COMMA
          ) || 'null';
      }
      return [
        `new Behavior(${name}, [${extraArgs.join(', ')}])`,
        Blockly.JavaScript.ORDER_ATOMIC,
      ];
    };

    Blockly.Blocks.behavior_definition =
      Blockly.Block.createProcedureDefinitionBlock({
        initPostScript(block) {
          block.setHSV(136, 0.84, 0.8);
          block.parameterNames_ = [i18n.thisSprite()];
          block.parameterTypes_ = [Blockly.BlockValueType.SPRITE];
          block.setUserVisible(false);
        },
        overrides: {
          getVars(category) {
            return {};
          },
          callType_: 'gamelab_behavior_get',
        },
      });

    generator.behavior_definition = generator.procedures_defnoreturn;

    Blockly.Procedures.DEFINITION_BLOCK_TYPES.push('behavior_definition');
    Blockly.Variables.registerGetter(
      Blockly.BlockValueType.BEHAVIOR,
      'gamelab_behavior_get'
    );

    Blockly.Blocks.sprite_parameter_get = {
      init() {
        var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
        // Must be marked EDITABLE so that cloned blocks share the same var name
        fieldLabel.EDITABLE = true;
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.appendDummyInput()
          .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
          .appendField(fieldLabel, 'VAR')
          .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        this.setStrictOutput(true, Blockly.BlockValueType.SPRITE);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
      },
      renameVar(oldName, newName) {
        if (behaviorEditor.isOpen()) {
          behaviorEditor.renameParameter(oldName, newName);
          behaviorEditor.refreshParamsEverywhere();
        }
      },
      removeVar: Blockly.Blocks.variables_get.removeVar,
    };
    generator.sprite_parameter_get = generator.variables_get;
  },
};
