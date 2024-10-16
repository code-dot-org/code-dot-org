import {Link} from '@dsco_/link';
import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';

export default function MethodNameEditor({method, updateMethod}) {
  const editLink = (
    <>
      Go to{' '}
      <Link href={`/programming_methods/${method.id}/edit`} openInNewTab>
        the method's edit page
      </Link>{' '}
      to edit.
    </>
  );
  return (
    <div>
      <label>
        Display Name
        <input
          value={method.name || ''}
          onChange={e => updateMethod('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <div>{method.id ? editLink : 'Save page to generate edit link.'}</div>
    </div>
  );
}

MethodNameEditor.propTypes = {
  method: PropTypes.object.isRequired,
  updateMethod: PropTypes.func.isRequired,
};

const styles = {
  textInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    margin: 0,
  },
};
