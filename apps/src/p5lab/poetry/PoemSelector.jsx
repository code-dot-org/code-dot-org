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
    const poemTitle = e.target.value;
    setSelectedPoem(poemTitle);

    if (poemTitle === msg.enterMyOwn()) {
      setIsOpen(true);
    } else {
      const poem = Object.values(POEMS).find(poem => poem.title === poemTitle);
      if (poem) {
        props.onChangePoem(poem);
      }
    }
  };

  if (!selectedPoem) {
    const defaultPoem = POEMS[appOptions.level.defaultPoem];
    if (defaultPoem) {
      setSelectedPoem(defaultPoem.title);
      props.onChangePoem(defaultPoem);
    }
  }

  return (
    <div style={styles.container}>
      <PoemEditor isOpen={isOpen} handleClose={handleClose} />
      <label>
        <b>{msg.selectPoem()}</b>
      </label>
      <select value={selectedPoem} style={styles.selector} onChange={onChange}>
        {Object.values(POEMS).map(poem => (
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
