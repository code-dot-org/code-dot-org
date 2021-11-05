import PropTypes from 'prop-types';
import React from 'react';
import ParameterEditor from './ParameterEditor';
import Button from '@cdo/apps/templates/Button';
import {createUuid} from '@cdo/apps/utils';

export default function OrderableList({list, setList, addButtonText}) {
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
        <div key={item.key}>
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
            <i
              onClick={() => removeItem(idx)}
              style={styles.controlButton}
              className="fa fa-trash"
            />
          </div>
          <ParameterEditor
            item={item}
            update={(key, value) => updateItem(idx, key, value)}
          />
        </div>
      ))}
      <Button onClick={addItem} text={addButtonText} color="gray" />
    </div>
  );
}

OrderableList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object).isRequired,
  setList: PropTypes.func.isRequired,
  addButtonText: PropTypes.string.isRequired
};

const styles = {
  controls: {
    display: 'flex'
  },
  controlButton: {
    margin: '0px 5px',
    cursor: 'pointer'
  }
};
