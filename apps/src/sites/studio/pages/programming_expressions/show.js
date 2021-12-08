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
  store.dispatch(setInitialAnimationList(exampleSprites));
  Blockly.assetUrl = assetUrl;
  console.log(Blockly);
  Blockly.valueTypeTabShapeMap = valueTypeTabShapeMap(Blockly);
  Blockly.typeHints = true;
  Blockly.Css.inject(document);

  //commonBlocks.install(window.Blockly, {});

  const customBlocksConfig = getScriptData('customBlocksConfig');
  installCustomBlocks({
    blockly: window.Blockly,
    blockDefinitions: customBlocksConfig,
    customInputTypes
  });

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
