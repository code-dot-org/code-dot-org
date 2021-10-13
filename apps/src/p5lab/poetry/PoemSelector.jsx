/* global appOptions */
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
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
  if (!appOptions.level.showPoemDropdown) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPoem, setSelectedPoem] = useState(undefined);

  const handleClose = poem => {
    props.onChangePoem(poem);
    setIsOpen(false);
  };

  const onChange = e => {
    const poemKey = e.target.value;
    setSelectedPoem(poemKey);

    if (poemKey === msg.enterMyOwn()) {
      setIsOpen(true);
    } else {
      const poem = poemObject(poemKey);
      if (poem) {
        props.onChangePoem(poem);
      }
    }
  };

  const poemObject = key => {
    if (!key || !POEMS[key]) {
      return undefined;
    }
    return {
      author: POEMS[key].author,
      title: msg[`${key}Title`](),
      lines: msg[`${key}Lines`]().split('\n')
    };
  };

  if (!selectedPoem) {
    const defaultPoem = poemObject(appOptions.level.defaultPoem);
    if (defaultPoem) {
      setSelectedPoem(appOptions.level.defaultPoem);
      props.onChangePoem(defaultPoem);
    }
  }

  const sortedPoemOptions = () => {
    var sortedPoemsByTitle = _.sortBy(
      // Need translated title to be sorted on
      Object.keys(POEMS).map(poemKey => ({
        key: poemKey,
        title: msg[`${poemKey}Title`]()
      })),
      'title'
    );

    return sortedPoemsByTitle.map(poem => (
      // Using poem.key because that remains untranslated
      <option key={poem.key} value={poem.key}>
        {poem.title}
      </option>
    ));
  };

  return (
    <div style={styles.container}>
      <PoemEditor isOpen={isOpen} handleClose={handleClose} />
      <label>
        <b>{msg.selectPoem()}</b>
      </label>
      <select value={selectedPoem} style={styles.selector} onChange={onChange}>
        {sortedPoemOptions()}
        <option key={msg.enterMyOwn()} value={msg.enterMyOwn()}>
          {msg.enterMyOwn()}
        </option>
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
  state => ({}),
  dispatch => ({
    onChangePoem(poem) {
      dispatch(setPoem(poem));
    }
  })
)(PoemSelector);
