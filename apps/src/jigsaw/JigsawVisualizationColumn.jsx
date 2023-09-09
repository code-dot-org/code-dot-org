import React from 'react';
import GameButtons from '../templates/GameButtons';
import BelowVisualization from '../templates/BelowVisualization';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

/**
 * For jigsaw, this all ends up being hidden, but StudioApp still has expectation
 * about certain elements existing
 */
var JigsawVisualizationColumn = function () {
  return (
    <span>
      <ProtectedVisualizationDiv />
      <GameButtons />
      <BelowVisualization />
    </span>
  );
};

module.exports = JigsawVisualizationColumn;
