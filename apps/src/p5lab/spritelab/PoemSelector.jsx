import React from 'react';
import msg from '@cdo/spritelab/locale';
import {APP_WIDTH} from '../constants';

const poems = [
  {
    title: 'I Wandered Lonely as a Cloud',
    author: 'William Wordsworth',
    lines: [
      'I wandered lonely as a cloud',
      "That floats on high o'er vales and hills,",
      'When all at once I saw a crowd,',
      'A host, of golden daffodils;',
      'Beside the lake, beneath the trees,',
      'Fluttering and dancing in the breeze.'
    ]
  },
  {
    title: 'If I can Stop one Heart from Breaking',
    author: 'Emily Dickinson',
    lines: [
      'If I can stop one heart from breaking,',
      'I shall not live in vain;',
      'If I can ease one life the aching,',
      'Or cool one pain,',
      'Or help one fainting robin',
      'Unto his nest again,',
      'I shall not live in vain.'
    ]
  },
  {
    title: 'Batty',
    author: 'Shel Silverstein',
    lines: [
      'The baby bat',
      'Screamed out in fright',
      "'Turn on the dark;",
      "I'm afraid of the light.'"
    ]
  }
];
export default function PoemSelector(props) {
  return (
    <div style={styles.container}>
      <label>
        <b>{msg.selectPoem()}</b>
      </label>
      <select style={styles.selector}>
        {poems.map(poem => (
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
