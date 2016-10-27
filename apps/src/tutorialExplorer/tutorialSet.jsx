/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import React from 'react';
import Tutorial from './tutorial';
import shapes from './shapes';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const TutorialSet = React.createClass({
  propTypes: {
    tutorials: React.PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    filters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired
  },

  render() {
    return (
      <div
        className="col-80"
        style={{float: 'left'}}
      >
        <ReactCSSTransitionGroup
          transitionName="fadable"
          transitionAppear={true}
          transitionLeave={false}
          transitionEnterTimeout={200}
          transitionAppearTimeout={200}
        >

          {this.props.tutorials.map((item, index) => (
            <Tutorial
              item={item}
              filters={this.props.filters}
              key={`item_${item.code}_${index}`}
            />
          ))}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});

export default TutorialSet;
