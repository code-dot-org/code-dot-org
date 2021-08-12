import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {setPoem} from '../redux/poemBot';
import msg from '@cdo/spritelab/locale';
import {APP_WIDTH} from '../constants';

const poems = [
  {
    title: '',
    author: '',
    lines: []
  },
  {
    title: 'I Wandered Lonely as a Cloud',
    author: 'William Wordsworth',
    lines: [
      [{value: 'I wandered lonely as a cloud', type: 'literal'}],
      [{value: "That floats on high o'er vales and hills,", type: 'literal'}],
      [{value: 'When all at once I saw a crowd,', type: 'literal'}],
      [{value: 'A host, of golden daffodils;', type: 'literal'}],
      [{value: 'Beside the lake, beneath the trees,', type: 'literal'}],
      [{value: 'Fluttering and dancing in the breeze.', type: 'literal'}]
    ]
  },
  {
    title: 'If I can Stop one Heart from Breaking',
    author: 'Emily Dickinson',
    lines: [
      [{value: 'If I can stop one heart from breaking,', type: 'literal'}],
      [{value: 'I shall not live in vain;', type: 'literal'}],
      [{value: 'If I can ease one life the aching,', type: 'literal'}],
      [{value: 'Or cool one pain,', type: 'literal'}],
      [{value: 'Or help one fainting robin', type: 'literal'}],
      [{value: 'Unto his nest again,', type: 'literal'}],
      [{value: 'I shall not live in vain.', type: 'literal'}]
    ]
  },
  {
    title: 'Batty',
    author: 'Shel Silverstein',
    lines: [
      [{value: 'The baby bat', type: 'literal'}],
      [{value: 'Screamed out in fright', type: 'literal'}],
      [{value: "'Turn on the dark;", type: 'literal'}],
      [{value: "I'm afraid of the light.'", type: 'literal'}]
    ]
  }
];
function PoemSelector(props) {
  const onChange = e => {
    const poemTitle = e.target.value;
    const poem = poems.find(poem => poem.title === poemTitle);
    if (poem) {
      props.onChangePoem(poem);
    }
  };

  return (
    <div style={styles.container}>
      <label>
        <b>{msg.selectPoem()}</b>
      </label>
      <select style={styles.selector} onChange={onChange}>
        {poems.map(poem => (
          <option key={poem.title} value={poem.title}>
            {poem.title}
          </option>
        ))}
      </select>
    </div>
  );
}

PoemSelector.propTypes = {
  // from Redux
  onChangePoem: PropTypes.func.isRequired
};

const styles = {
  container: {
    maxWidth: APP_WIDTH
  },
  selector: {
    width: '100%'
  }
};

export default connect(
  state => ({}),
  dispatch => ({
    onChangePoem(poem) {
      dispatch(setPoem(poem));
    }
  })
)(PoemSelector);
