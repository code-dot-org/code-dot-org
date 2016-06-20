import React from 'react';

import color from '../color';

var examples = [];

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

function Colors() {
  return (
    <div>
      <h2>Colors</h2>
      <p>
        These are the standard colors available in SCSS and javascript.
      </p>
      <p>
        JavaScript usage is as follows:
      </p>
      <pre>
        {`import colors from '@cdo/apps/colors';
console.log("the hex value for purple is:", colors.purple);`}
      </pre>
      {Object.keys(color).map(colorKey => (
         <div key={colorKey} style={{display: 'inline-block',
                                     whiteSpace: 'nowrap',
                                     width: '33%',}}>
           <div style={{display: 'inline-block',
                        border: '1px solid black',
                        width: 50,
                        height: 50,
                        backgroundColor: color[colorKey]}}/>
           <div style={{display: 'inline-block',
                        position: 'relative',
                        bottom: 12.5,
                        paddingLeft: 10,}}>
             <div>{colorKey}</div>
             <div>{color[colorKey]}</div>
           </div>
         </div>
       ))}
    </div>
  );
}

function Components() {
  return (
    <div>
      <h2>React Components</h2>
      {examples.map((exampleConfig, index) => (
         <div key={index}>
           <h3>{exampleConfig.component.displayName} - {exampleConfig.path}</h3>
           <p>{exampleConfig.example && exampleConfig.example.description}</p>
           {
             exampleConfig.example ?
             exampleConfig.example.examples.map((example, index) => (
               <div key={index}>
                 <p><strong>Example #{index+1}: {example.description}</strong></p>
                 <div style={{padding: 10}}>
                   {!example.render &&
                    <pre>{renderExampleJSX(exampleConfig.component.displayName, example.props)}</pre>
                   }
                   {!example.render && React.createElement(exampleConfig.component, example.props)}
                   {example.render && example.render()}
                 </div>
               </div>
             ))
             :
             <p>No Examples Provided</p>
           }
         </div>
       ))}
    </div>
  );
}

const StyleGuide = React.createClass({
  render() {
    var style = {
      backgroundColor: 'white',
      padding: 10,
    };
    return (
      <div style={style}>
        <h1>Style Guide</h1>
        <Colors/>
        <Components/>
      </div>
    );
  }
});

export default StyleGuide;
