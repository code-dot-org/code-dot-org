/* global appOptions */
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {setPoem} from '../redux/poetry';
import msg from '@cdo/poetry/locale';
import {APP_WIDTH} from '../constants';
import {POEMS} from './constants';

function PoemSelector(props) {
  const [selectedPoem, setSelectedPoem] = useState(undefined);

  const onChange = e => {
    const poemTitle = e.target.value;
    setSelectedPoem(poemTitle);
    const poem = Object.values(POEMS).find(poem => poem.title === poemTitle);
    if (poem) {
      props.onChangePoem(poem);
    }
  };

  if (!selectedPoem) {
    const defaultPoem = POEMS[appOptions.level.defaultPoem];
    setSelectedPoem(defaultPoem.title);
    props.onChangePoem(defaultPoem);
  }

  return (
    <div style={styles.container}>
      <label>
        <b>{msg.selectPoem()}</b>
      </label>
      <select value={selectedPoem} style={styles.selector} onChange={onChange}>
        {Object.values(POEMS).map(poem => (
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
