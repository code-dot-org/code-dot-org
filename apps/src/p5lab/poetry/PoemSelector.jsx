/* global appOptions */
import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import project from '@cdo/apps/code-studio/initApp/project';
import {setPoem} from '../redux/poetry';
import msg from '@cdo/poetry/locale';
import {APP_WIDTH} from '../constants';
import {POEMS, PoetryStandaloneApp} from './constants';
import * as utils from '@cdo/apps/utils';

export function PoemEditor(props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [poem, setPoem] = useState('');
  const [error, setError] = useState(null);

  // Reset error if editor is opened/closed or form state changes.
  useEffect(() => {
    setError(null);
  }, [props.isOpen, title, author, poem]);

  const body = (
    <div>
      <div style={styles.modalContainer}>
        <label style={styles.label}>{msg.title()}</label>
        <input
          style={styles.input}
          value={title}
          onChange={event => setTitle(event.target.value)}
        />
      </div>
      <div style={styles.modalContainer}>
        <label style={styles.label}>{msg.author()}</label>
        <input
          style={styles.input}
          value={author}
          onChange={event => setAuthor(event.target.value)}
        />
      </div>
      <div style={styles.modalContainer}>
        <label style={styles.label}>{msg.poem()}</label>
        <textarea
          style={styles.input}
          value={poem}
          onChange={event => setPoem(event.target.value)}
        />
      </div>
    </div>
  );

  const onSave = () => {
    const closeAndSave = () =>
      props.handleClose({title, author, lines: poem.split('\n')});

    utils
      .findProfanity(
        [title, author, poem].join(' '),
        appOptions.locale,
        appOptions.authenticityToken
      )
      .done(profaneWords => {
        if (profaneWords?.length > 0) {
          setError(
            msg.profanityFoundError({
              wordCount: profaneWords.length,
              words: profaneWords.join(', ')
            })
          );
        } else {
          closeAndSave();
        }
      })
      // Don't block the user in the case of a server error.
      .fail(closeAndSave);
  };

  const footer = [
    error && (
      <div style={styles.error} key="error">
        {error}
      </div>
    ),
    <FooterButton text={msg.save()} onClick={onSave} type="confirm" key="btn" />
  ];

  return (
    <StylizedBaseDialog
      body={body}
      title={msg.editCustomPoem()}
      isOpen={props.isOpen}
      handleClose={props.handleClose}
      renderFooter={() => footer}
    />
  );
}

PoemEditor.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};

function PoemSelector(props) {
  if (appOptions.level.standaloneAppName !== PoetryStandaloneApp.PoetryHoc) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = poem => {
    project.saveSelectedPoem(poem);
    props.onChangePoem(poem);
    setIsOpen(false);
  };

  const onChange = e => {
    const poemTitle = e.target.value;

    if (poemTitle === msg.enterMyOwn()) {
      setIsOpen(true);
    } else {
      const poem = Object.values(POEMS).find(poem => poem.title === poemTitle);
      if (poem) {
        props.onChangePoem(poem);
        project.saveSelectedPoem(poem);
      }
    }
  };

  const getDropdownValue = () => {
    const poem = Object.values(POEMS).find(
      poem => poem.title === props.selectedPoem.title
    );
    if (poem) {
      return poem.title;
    } else {
      return msg.enterMyOwn();
    }
  };

  const getPoemOptions = () => {
    return Object.values(POEMS).sort((a, b) => (a.title > b.title ? 1 : -1));
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
          <option key={poem.title} value={poem.title}>
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
  },
  error: {
    color: color.red,
    fontStyle: 'italic',
    textAlign: 'right',
    marginRight: 5
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
