import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ProgrammingExpressionOverview from '@cdo/apps/templates/codeDocs/ProgrammingExpressionOverview';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import {installCustomBlocks} from '@cdo/apps/block_utils';
import {customInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import animationList, {
  setInitialAnimationList
} from '@cdo/apps/p5lab/redux/animationList';
import {
  valueTypeTabShapeMap,
  exampleSprites
} from '@cdo/apps/p5lab/spritelab/constants';
import assetUrl from '@cdo/apps/code-studio/assetUrl';

$(document).ready(() => {
  registerReducers({
    instructionsDialog,
    animationList
  });
  const store = getStore();
  const customBlocksConfig = getScriptData('customBlocksConfig');
  if (customBlocksConfig) {
    Blockly.assetUrl = assetUrl;
    Blockly.typeHints = true;
    Blockly.Css.inject(document);

    // Spritelab-specific logic but not harmful to other labs.
    store.dispatch(setInitialAnimationList(exampleSprites));
    Blockly.valueTypeTabShapeMap = valueTypeTabShapeMap(Blockly);

    installCustomBlocks({
      blockly: Blockly,
      blockDefinitions: customBlocksConfig,
      customInputTypes
    });
  }

  const programmingExpression = getScriptData('programmingExpression');
  ReactDOM.render(
    <Provider store={store}>
      <>
        <ProgrammingExpressionOverview
          programmingExpression={programmingExpression}
        />
        <ExpandableImageDialog />
      </>
    </Provider>,
    document.getElementById('show-container')
  );
});
