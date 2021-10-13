/* global appOptions */
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import project from '@cdo/apps/code-studio/initApp/project';
import {setPoem} from '../redux/poetry';
import msg from '@cdo/poetry/locale';
import {APP_WIDTH} from '../constants';
import {POEMS} from './constants';
import _ from 'lodash';

function PoemEditor(props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [poem, setPoem] = useState('');

  const body = (
    <div>
      <div style={styles.modalContainer}>
        <label style={styles.label}>{`${msg.title()}: `}</label>
        <input
          style={styles.input}
          value={title}
          onChange={event => setTitle(event.target.value)}
        />
      </div>
      <div style={styles.modalContainer}>
        <label style={styles.label}>{`${msg.author()}: `}</label>
        <input
          style={styles.input}
          value={author}
          onChange={event => setAuthor(event.target.value)}
        />
      </div>
      <div style={styles.modalContainer}>
        <label style={styles.label}>{`${msg.poem()}: `}</label>
        <textarea
          style={styles.input}
          value={poem}
          onChange={event => setPoem(event.target.value)}
        />
      </div>
    </div>
  );

  const footerButton = (
    <FooterButton
      text={msg.save()}
      onClick={() =>
        props.handleClose({title, author, lines: poem.split('\n')})
      }
      type="confirm"
    />
  );

  return (
    <StylizedBaseDialog
      body={body}
      title={msg.editCustomPoem()}
      isOpen={props.isOpen}
      handleClose={props.handleClose}
      renderFooter={() => footerButton}
    />
  );
}

PoemEditor.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};

function PoemSelector(props) {
  if (appOptions.level.standaloneAppName !== 'poetry_hoc') {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = poem => {
    project.saveSelectedPoem(poem);
    props.onChangePoem(poem);
    setIsOpen(false);
  };

  const onChange = e => {
    const poemKey = e.target.value;
    const poem = poemObject(poemKey);

    if (poem.key === msg.enterMyOwn()) {
      setIsOpen(true);
    } else if (poem) {
      props.onChangePoem(poem);
      project.saveSelectedPoem(poem);
    }
  };

  const poemObject = key => {
    if (!key || !POEMS[key]) {
      return undefined;
    }
    return {
      key: key,
      author: POEMS[key].author,
      title: msg[`${key}Title`](),
      lines: msg[`${key}Lines`]().split('\n')
    };
  };

  const getDropdownValue = () => {
    const poem = poemObject(props.selectedPoem.key);
    if (poem) {
      return poem.title;
    } else {
      return msg.enterMyOwn();
    }
  };

  const getPoemOptions = () => {
    return Object.keys(POEMS)
      .map(poemKey => poemObject(poemKey))
      .sort((a, b) => (a.title > b.title ? 1 : -1));
  };

  return (
    <div style={styles.container}>
      <PoemEditor isOpen={isOpen} handleClose={handleClose} />
      <label>
        <b>{msg.selectPoem()}</b>
      </label>
      <select
        value={getDropdownValue()}
        style={styles.selector}
        onChange={onChange}
      >
        {getPoemOptions().map(poem => (
          // Using poem.key because that remains untranslated
          <option key={poem.key} value={poem.key}>
            {poem.title}
          </option>
        ))}
        <option key={msg.enterMyOwn()} value={msg.enterMyOwn()}>
          {msg.enterMyOwn()}
        </option>
      </select>
    </div>
  );
}

PoemSelector.propTypes = {
  // from Redux
  selectedPoem: PropTypes.object.isRequired,
  onChangePoem: PropTypes.func.isRequired
};

const styles = {
  container: {
    maxWidth: APP_WIDTH
  },
  selector: {
    width: '100%'
  },
  label: {
    flex: 1
  },
  input: {
    flex: 2
  },
  modalContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 10
  }
};

export default connect(
  state => ({
    selectedPoem: state.poetry.selectedPoem
  }),
  dispatch => ({
    onChangePoem(poem) {
      dispatch(setPoem(poem));
    }
  })
)(PoemSelector);
