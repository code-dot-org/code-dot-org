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

export function ProgressTableTextCell({text, style}) {
  return <div style={{...styles.text, ...style}}>{text}</div>;
}
ProgressTableTextCell.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  style: PropTypes.object
};

export function ProgressTableTextLabelCell({text}) {
  return <div style={styles.label}>{text}</div>;
}
ProgressTableTextLabelCell.propTypes = {
  text: PropTypes.string.isRequired
};

export function ProgressTableTextCellGroup({textDataList}) {
  const getSublevelPadding = sublevelCount =>
    sublevelCount ? sublevelCount * 25.5 : 0;

  return (
    <div style={styles.group}>
      {textDataList.map(({text, sublevelCount}, i) => {
        return (
          <ProgressTableTextCell
            text={text}
            key={`${text}-${i}`}
            style={{paddingRight: `${getSublevelPadding(sublevelCount)}px`}}
          />
        );
      })}
    </div>
  );
}
const textDataShape = PropTypes.shape({
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sublevelCount: PropTypes.number
});
ProgressTableTextCellGroup.propTypes = {
  textDataList: PropTypes.arrayOf(textDataShape).isRequired
};
