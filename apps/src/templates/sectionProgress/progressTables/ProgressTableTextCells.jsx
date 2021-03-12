import PropTypes from 'prop-types';
import React from 'react';

const styles = {
  text: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minWidth: '30px'
  },
  label: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
    paddingRight: '10px'
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
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
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
