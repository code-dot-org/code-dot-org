import React from 'react';
import $ from 'jquery';

export default React.createClass({

  propTypes: {
    project: React.PropTypes.shape({
      channel: React.PropTypes.shape({
        name: React.PropTypes.string
      }),
      sources: React.PropTypes.shape({
        html: React.PropTypes.string,
      }),
    }),
  },

  getInitialState() {
    return {
    };
  },

  render() {
    var html = this.props.project.sources.html;
    var screens = [];
    $(html).find('.screen').each((index, screen) => {
      $(screen).css('position', 'inherit')
               .css('display', 'block');
      screens.push(
        <li key={screen.id} style={{position: 'relative', paddingLeft: 70, height: 100}}>
          <div dangerouslySetInnerHTML={{__html: screen.outerHTML}}
               style={{
                   display: 'inline-block',
                   position: 'absolute',
                   left: 0,
                   transform: 'scale(.2)',
                   transformOrigin: 'top left',
                 }}
          />
          {screen.id}
        </li>
      );
    });
    return (
      <div>
        <h1>Import from Project: {this.props.project.channel.name}</h1>
        <h2>Screens</h2>
        <ul>
          {screens}
        </ul>
        <button>Import</button>
      </div>
    );
  }
});
