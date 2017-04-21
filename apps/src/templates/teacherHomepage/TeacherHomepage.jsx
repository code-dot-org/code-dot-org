import React from 'react';

const TeacherHomepage = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.arrayOf(React.PropTypes.node)
    ])
  },

  render() {
    const content = this.props.children;

    return (
      <div>
        {content}
      </div>
    );
  }
});

export default TeacherHomepage;
