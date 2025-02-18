import React from 'react';

import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

var BelowVisualization = require('../templates/BelowVisualization');
var GameButtons = require('../templates/GameButtons').default;

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
