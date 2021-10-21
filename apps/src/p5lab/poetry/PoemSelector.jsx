/* global appOptions */
import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import color from '@cdo/apps/util/color';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import project from '@cdo/apps/code-studio/initApp/project';
import {setPoem} from '../redux/poetry';
import msg from '@cdo/poetry/locale';
import {APP_WIDTH} from '../constants';
import {POEMS, PoetryStandaloneApp} from './constants';
import {getPoem} from './poem';
import * as utils from '@cdo/apps/utils';

export function PoemEditor(props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [poem, setPoem] = useState('');
  const [error, setError] = useState(null);

  // Reset error if poem state changes.
  useEffect(() => {
    setError(null);
  }, [title, author, poem]);

  useEffect(() => {
    // Only clear poem state if the editor is closed when an error is present.
    if (!props.isOpen && error) {
      setTitle('');
      setAuthor('');
      setPoem('');
    }

    setError(null);
  }, [props.isOpen]);

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
    // If the dialog is dismissed, poem will be falsy. Don't update selected poem.
    if (poem) {
      project.saveSelectedPoem(poem);
      props.onChangePoem(poem);
    }
    setIsOpen(false);
  };

  const onChange = e => {
    const poemKey = e.value;
    const poem = getPoem(poemKey);

    if (poemKey === msg.enterMyOwn()) {
      setIsOpen(true);
    } else if (poem) {
      props.onChangePoem(poem);
      project.saveSelectedPoem(poem);
    }
  };

  const getDropdownValue = () => {
    const poem = getPoem(props.selectedPoem.key);
    if (poem) {
      return poem.key;
    } else {
      return msg.enterMyOwn();
    }
  };

  const getPoemOptions = () => {
    const options = Object.keys(POEMS)
      .map(poemKey => getPoem(poemKey))
      .sort((a, b) => (a.title > b.title ? 1 : -1))
      .map(poem => ({value: poem.key, label: poem.title}));
    options.push({value: msg.enterMyOwn(), label: msg.enterMyOwn()});
    return options;
  };

  return (
    <div id="poemSelector" style={styles.container}>
      <PoemEditor isOpen={isOpen} handleClose={handleClose} />
      <label>
        <b>{msg.selectPoem()}</b>
      </label>
      <div style={styles.selector}>
        <Select
          value={getDropdownValue()}
          clearable={false}
          searchable={false}
          onChange={onChange}
          options={getPoemOptions()}
        />
      </div>
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
    width: '100%',
    marginBottom: 10
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
