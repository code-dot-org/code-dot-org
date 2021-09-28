import React from 'react';
import msg from '@cdo/poetry/locale';
import {APP_WIDTH} from '../constants';
import {POEMS} from './constants';

export default function PoemSelector(props) {
  const onChange = e => {
    const poemTitle = e.target.value;
    const poem = Object.values(POEMS).find(poem => poem.title === poemTitle);
    if (poem) {
      console.log(poem);
    }
  };
  return (
    <div style={styles.container}>
      <label>
        <b>{msg.selectPoem()}</b>
      </label>
      <select style={styles.selector} onChange={onChange}>
        {Object.values(POEMS).map(poem => (
          <option key={poem.title} value={poem.title}>
            {poem.title}
          </option>
        ))}
      </select>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: APP_WIDTH
  },
  selector: {
    width: '100%'
  }
};
