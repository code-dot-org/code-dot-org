import * as storybook from '@kadira/storybook';
import color from '../src/color';

const styles = {
  colorWrapper: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    width: '33%',
  },
  colorBox: {
    display: 'inline-block',
    border: '1px solid black',
    width: 50,
    height: 50,
  },
  colorDoc: {
    display: 'inline-block',
    position: 'relative',
    bottom: 12.5,
    paddingLeft: 10
  },
};

storybook
  .storiesOf('Colors', module)
  .add('All of them', () => (
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
         <div key={colorKey} style={styles.colorWrapper}>
           <div style={Object.assign({}, styles.colorBox, {backgroundColor: color[colorKey]})}/>
           <div style={styles.colorDoc}>
             <div>{colorKey}</div>
             <div>{color[colorKey]}</div>
           </div>
         </div>
       ))}
    </div>
  ));
