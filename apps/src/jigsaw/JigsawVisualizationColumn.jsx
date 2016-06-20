import React from 'react';
var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

/**
 * For jigsaw, this all ends up being hidden, but StudioApp still has expectation
 * about certain elements existing
 */
var JigsawVisualizationColumn = function () {
  return (
    <span>
      <ProtectedVisualizationDiv />
      <GameButtons/>
      <BelowVisualization/>
    </span>
  );
};

module.exports = JigsawVisualizationColumn;
