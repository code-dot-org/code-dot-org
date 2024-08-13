import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {createUuid} from '@cdo/apps/utils';

export default function OrderableList({
  list,
  setList,
  addButtonText,
  renderItem,
  checkItemDeletionAllowed = item => true,
}) {
  const addItem = () => {
    const newParams = [...list, {key: createUuid()}];
    setList(newParams);
  };
  const updateItem = (idx, key, value) => {
    const newParams = [...list];
    newParams[idx] = {...newParams[idx], [key]: value};
    setList(newParams);
  };
  const moveItem = (idx, direction) => {
    const newParams = [...list];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = newParams[idx];
    newParams[idx] = newParams[swapIdx];
    newParams[swapIdx] = temp;
    setList(newParams);
  };
  const removeItem = idx => {
    const newParams = [...list];
    newParams.splice(idx, 1);
    setList(newParams);
  };
  return (
    <div>
      {list.map((item, idx) => (
        <div key={item.key} style={styles.item}>
          {' '}
          <div style={styles.controls}>
            {idx !== 0 && (
              <i
                onClick={() => moveItem(idx, 'up')}
                style={styles.controlButton}
                className="fa fa-caret-up"
              />
            )}
            {idx !== list.length - 1 && (
              <i
                onClick={() => moveItem(idx, 'down')}
                style={styles.controlButton}
                className="fa fa-caret-down"
              />
            )}
            {checkItemDeletionAllowed(item) && (
              <i
                onClick={() => removeItem(idx)}
                style={styles.controlButton}
                className="fa fa-trash"
              />
            )}
          </div>
          {renderItem(item, (key, value) => updateItem(idx, key, value))}
        </div>
      ))}
      <Button
        onClick={addItem}
        text={addButtonText}
        color="gray"
        style={styles.button}
      />
    </div>
  );
}

OrderableList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object).isRequired,
  setList: PropTypes.func.isRequired,
  addButtonText: PropTypes.string.isRequired,
  renderItem: PropTypes.func.isRequired,
  checkItemDeletionAllowed: PropTypes.func,
};

const styles = {
  button: {
    marginLeft: 0,
  },
  controlButton: {
    margin: '0px 5px',
    cursor: 'pointer',
  },
  controls: {
    display: 'flex',
  },
  item: {
    paddingBottom: 15,
  },
};
