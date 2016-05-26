import React from 'react';

var STAGE_PROGRESS_TYPE = React.PropTypes.arrayOf(React.PropTypes.shape({
  title: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
  name: React.PropTypes.string,
  status: React.PropTypes.string,
  kind: React.PropTypes.oneOf(['unplugged', 'assessment', 'puzzle']),
  icon: React.PropTypes.string,
  url: React.PropTypes.string,
  id: React.PropTypes.number
}));
module.exports.STAGE_PROGRESS_TYPE = STAGE_PROGRESS_TYPE;

var STAGE_TYPE = React.PropTypes.shape({
  name: React.PropTypes.string,
  lesson_plan_html_url: React.PropTypes.string,
  flex_category: React.PropTypes.string,
  levels: STAGE_PROGRESS_TYPE
});
module.exports.STAGE_TYPE = STAGE_TYPE;
