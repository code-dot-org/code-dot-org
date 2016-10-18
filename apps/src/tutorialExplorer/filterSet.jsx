/* FilterSet: The overall search area in TutorialExplorer.  Contains a set of filter groups.
 */

import React from 'react';
import FilterGroup from './filterGroup';
import shapes from './shapes';

const FilterSet = React.createClass({
  propTypes: {
    filterGroups: React.PropTypes.array.isRequired,
    onUserInput: React.PropTypes.func.isRequired,
    selection: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    backButton: shapes.backButton,
    imageButton: shapes.imageButton
  },

  render() {
    return (
      <div>
        <div className="col-20">

          {this.props.backButton && (
            <a href={this.props.backButton.url}>
              <button style={{marginTop: 7, marginBottom: 10}}>
                <i className="fa fa-arrow-left" aria-hidden={true}/>
                &nbsp;
                {this.props.backButton.text}
              </button>
            </a>
          )}

          <div style={{fontSize: 16, paddingLeft: 10}}>
            Filter By
          </div>
          {this.props.filterGroups.map(item =>
            item.display !== false && (
              <FilterGroup
                name={item.name}
                text={item.text}
                filterEntries={item.entries}
                onUserInput={this.props.onUserInput}
                selection={this.props.selection[item.name]}
                key={item.name}
              />
            )
          )}

          {this.props.imageButton && (
            <a href={this.props.imageButton.url}>
              <img src={this.props.imageButton.imageUrl} style={{marginTop: 10}}/>
            </a>
          )}

        </div>
      </div>
    );
  }
});

export default FilterSet;
