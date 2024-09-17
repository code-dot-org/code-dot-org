import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';

import 'react-select/dist/react-select.css';
import project from '@cdo/apps/code-studio/initApp/project';
import fontConstants from '@cdo/apps/fontConstants';
import StylizedBaseDialog, {
  FooterButton,
} from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import color from '@cdo/apps/util/color';
import * as utils from '@cdo/apps/utils';
import msg from '@cdo/poetry/locale';

import {APP_WIDTH} from '../constants';
import {setPoem} from '../redux/poetry';

import {PoetryStandaloneApp} from './constants';
import {getPoem, shouldAlphabetizePoems} from './poem';

const poemShape = PropTypes.shape({
  key: PropTypes.string,
  title: PropTypes.string,
  author: PropTypes.string,
  lines: PropTypes.arrayOf(PropTypes.string),
});

export function PoemEditor(props) {
  const {initialPoem} = props;
  const [title, setTitle] = useState(initialPoem.title || '');
  const [author, setAuthor] = useState(initialPoem.author || '');
  const [poem, setPoem] = useState(initialPoem.lines?.join('\n') || '');
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
  }, [props.isOpen, error]);

  const body = (
    <form style={{margin: 0}}>
      <label style={styles.labelContainer}>
        <span style={styles.label}>{msg.title()}</span>
        <input
          style={styles.input}
          value={title}
          onChange={event => setTitle(event.target.value)}
        />
      </label>
      <label style={styles.labelContainer}>
        <span style={styles.label}>{msg.author()}</span>
        <input
          style={styles.input}
          value={author}
          onChange={event => setAuthor(event.target.value)}
        />
      </label>
      <div style={styles.warning}>{msg.authorWarning()}</div>
      <label style={styles.labelContainer}>
        <span style={styles.label}>{msg.poem()}</span>
        <textarea
          style={styles.input}
          value={poem}
          onChange={event => setPoem(event.target.value)}
        />
      </label>
    </form>
  );

  const onSave = () => {
    const closeAndSave = () =>
      props.handleClose({
        key: msg.enterMyOwn(),
        title,
        author,
        lines: poem.split('\n'),
      });

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
              words: profaneWords.join(', '),
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
    <FooterButton
      text={msg.save()}
      onClick={onSave}
      type="confirm"
      key="btn"
    />,
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
  handleClose: PropTypes.func.isRequired,
  initialPoem: poemShape,
};
PoemEditor.defaultProps = {
  initialPoem: {},
};

function PoemSelector(props) {
  const [isOpen, setIsOpen] = useState(false);

  if (appOptions.level.standaloneAppName === PoetryStandaloneApp.Poetry) {
    return null;
  }

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
    if (poemKey === msg.enterMyOwn()) {
      setIsOpen(true);
      return;
    }

    let poem;
    if (poemKey === msg.chooseAPoem()) {
      poem = {
        key: msg.chooseAPoem(),
        author: '',
        title: '',
        lines: [],
      };
    } else {
      poem = getPoem(poemKey);
    }

    if (poem) {
      props.onChangePoem(poem);
      project.saveSelectedPoem(poem);
    }
  };

  const getPoemOptions = () => {
    let options = Object.keys(props.poemList)
      .map(poemKey => getPoem(poemKey))
      .filter(
        poem => !poem.locales || poem.locales.includes(appOptions.locale)
      );

    if (shouldAlphabetizePoems()) {
      options.sort((a, b) => (a.title > b.title ? 1 : -1));
    }
    options = options.map(poem => ({value: poem.key, label: poem.title}));
    // Add option to create your own poem to the top of the dropdown.
    options.unshift({value: msg.enterMyOwn(), label: msg.enterMyOwn()});
    // Add blank option that just says "Choose a Poem" to the top of the dropdown.
    options.unshift({value: msg.chooseAPoem(), label: msg.chooseAPoem()});
    return options;
  };

  const initialEditorPoem = () => {
    if (props.selectedPoem?.key === msg.enterMyOwn()) {
      return props.selectedPoem;
    }
  };

  return (
    <div id="poemSelector" style={styles.container}>
      <PoemEditor
        isOpen={isOpen}
        handleClose={handleClose}
        initialPoem={initialEditorPoem()}
      />
      <label>
        <b>{msg.selectPoem()}</b>
      </label>
      <div style={styles.selector}>
        <Select
          value={props.selectedPoem.key}
          clearable={false}
          searchable={false}
          onChange={onChange}
          options={getPoemOptions()}
          disabled={props.isRunning}
        />
      </div>
    </div>
  );
}

PoemSelector.propTypes = {
  // from Redux
  selectedPoem: poemShape.isRequired,
  isRunning: PropTypes.bool.isRequired,
  onChangePoem: PropTypes.func.isRequired,
  poemList: PropTypes.object,
};

const styles = {
  container: {
    maxWidth: APP_WIDTH,
  },
  selector: {
    width: '100%',
    marginBottom: 10,
  },
  label: {
    flex: 1,
  },
  input: {
    flex: 2,
  },
  labelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 10px 0 10px',
  },
  error: {
    color: color.red,
    fontStyle: 'italic',
    textAlign: 'right',
    marginRight: 5,
  },
  warning: {
    ...fontConstants['main-font-semi-bold'],
    textAlign: 'end',
    padding: '0 10px 10px 0',
  },
};

export default connect(
  state => ({
    selectedPoem: state.poetry.selectedPoem,
    isRunning: state.runState.isRunning,
    poemList: state.poetry.poemList,
  }),
  dispatch => ({
    onChangePoem(poem) {
      dispatch(setPoem(poem));
    },
  })
)(PoemSelector);
