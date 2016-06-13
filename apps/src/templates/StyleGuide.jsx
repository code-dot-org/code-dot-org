import React from 'react';

var examples = [];

// TODO: Ugh, code studio can't import this file because it doesn't use
// webpack to build. Find some better way to do this nonsense.
var context = require.context("../", true, /\.jsx$/);
context.keys().forEach(key => {
  var component = context(key);
  var path = key.slice(2);
  if (component) {
    examples.push({
      path,
      example: component.styleGuideExamples,
      component,
    });

    Object.keys(component).forEach(componentKey => {
      var subcomponent = component[componentKey];
      if (subcomponent.styleGuideExamples) {
        examples.push({
          path,
          example: subcomponent.styleGuideExamples,
          component: subcomponent,
        });
      }
    });
  }
});

examples.sort((a,b) => {
  if (a.example && !b.example) {
    return -1;
  }
  if (b.example && !a.example) {
    return 1;
  }
  return a.key - b.key;
});

function renderExampleJSX(displayName, props) {
  var s = '<';
  s += displayName;
  if (props) {
    Object.keys(props).forEach(key => {
      s += ` ${key}={${JSON.stringify(props[key])}}`;
    });
  }
  s += '/>';
  return s;
}

// TODO: Since code studio can't import this file, we have to make it available
// as a global. Which is also dumb. Don't do this!
window.StyleGuide = React.createClass({
  getInitialState() {
    return {
      show: false,
    };
  },

  render() {
    if (this.state.show) {
      var style = {
        backgroundColor: 'white',
        padding: 10,
      };
      return (
        <div style={style}>
          <h1>Style Guide</h1>
          {examples.map((exampleConfig, index) => (
             <div key={index}>
               <h1>{exampleConfig.component.displayName} - {exampleConfig.path}</h1>
               <p>{exampleConfig.example && exampleConfig.example.description}</p>
               {
                 exampleConfig.example ?
                 exampleConfig.example.examples.map((example, index) => (
                   <div key={index}>
                     <p><strong>Example #{index+1}: {example.description}</strong></p>
                     <div style={{padding: 10}}>
                       <pre>{renderExampleJSX(exampleConfig.component.displayName, example.props)}</pre>
                       {React.createElement(exampleConfig.component, example.props)}
                     </div>
                   </div>
                 ))
                 :
                 <p>No Examples Provided</p>
               }
             </div>
           ))}
          <button onClick={() => this.setState({show: false})}>Close Style Guide</button>
        </div>
      );
    } else {
      return (
        <div>
          <button onClick={() => this.setState({show: true})}>Open Style Guide</button>
        </div>
      );
    }
  }
});
