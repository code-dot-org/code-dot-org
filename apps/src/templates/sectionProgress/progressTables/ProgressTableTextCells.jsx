import PropTypes from 'prop-types';
import React from 'react';

const styles = {
  text: {
    display: 'flex',
    justifyContent: 'center'
  },
  label: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px'
  },
  group: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '5px'
  }
};

export function ProgressTableTextCell({text}) {
  return <div style={styles.text}>{text}</div>;
}

ProgressTableTextCell.propTypes = {
  text: PropTypes.string.isRequired
};

export function ProgressTableTextLabelCell({text}) {
  return <div style={styles.label}>{text}</div>;
}

ProgressTableTextLabelCell.propTypes = {
  text: PropTypes.string.isRequired
};

export function ProgressTableTextCellGroup({texts}) {
  return (
    <div style={styles.group}>
      {texts.map((text, i) => (
        <ProgressTableTextCell text={text} key={`${text}-${i}`} />
      ))}
    </div>
  );
}

ProgressTableTextCellGroup.propTypes = {
  texts: PropTypes.array.isRequired
};
