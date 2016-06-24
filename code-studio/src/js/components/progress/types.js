import React from 'react';

const levelProgressShape = React.PropTypes.shape({
  title: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
  name: React.PropTypes.string,
  status: React.PropTypes.string,
  kind: React.PropTypes.oneOf(['unplugged', 'assessment', 'puzzle', 'named_level']),
  icon: React.PropTypes.string,
  url: React.PropTypes.string,
  id: React.PropTypes.number
});
module.exports.levelProgressShape = levelProgressShape;

const stageProgressShape = React.PropTypes.arrayOf(levelProgressShape);
module.exports.stageProgressShape = stageProgressShape;

const stageShape = React.PropTypes.shape({
  name: React.PropTypes.string,
  lesson_plan_html_url: React.PropTypes.string,
  flex_category: React.PropTypes.string,
  levels: stageProgressShape
});
module.exports.stageShape = stageShape;

const peerReviewShape = React.PropTypes.shape({
  id: React.PropTypes.number,
  submitted: React.PropTypes.boolean
});
module.exports.peerReviewShape = peerReviewShape;
