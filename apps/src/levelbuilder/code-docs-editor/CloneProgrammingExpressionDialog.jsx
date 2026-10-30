import {TextLink} from '@dsco_/link';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import StylizedBaseDialog, {
  FooterButton,
} from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

export function CloneFormDialog({
  itemToClone,
  programmingEnvironmentsForSelect,
  categoriesForSelect,
  onClose,
  onCloneSuccess,
}) {
  const [destinationEnvironment, setDestinationEnvironment] = useState(null);
  const [destinationCategory, setDestinationCategory] = useState(null);
  const [error, setError] = useState(null);
  const cloneExpression = () => {
    const clonePath = `/programming_expressions/${itemToClone.id}/clone`;
    let success = false;
    fetch(clonePath, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destinationProgrammingEnvironmentName: destinationEnvironment,
        destinationCategoryKey: destinationCategory,
      }),
    })
      .then(response => {
        if (response.ok) {
          success = true;
        }
        return response.json();
      })
      .then(json => {
        if (success) {
          setError(null);
          onCloneSuccess(json.editUrl);
        } else {
          setError(json.error);
        }
      });
  };
  return (
    <StylizedBaseDialog
      handleConfirmation={() => {
        cloneExpression(destinationEnvironment, destinationCategory);
      }}
      handleClose={onClose}
      isOpen
    >
      {error && <div style={{color: 'red'}}>{error}</div>}
      <label>
        IDE to clone to
        <select
          onChange={e => setDestinationEnvironment(e.target.value)}
          value={destinationEnvironment || ''}
          style={styles.selectInput}
        >
          <option value="" />
          {programmingEnvironmentsForSelect
            .filter(env => env.id !== itemToClone.environmentId)
            .map(env => (
              <option key={env.name} value={env.name}>
                {env.title || env.name}
              </option>
            ))}
        </select>
      </label>
      {destinationEnvironment && (
        <label>
          Category to clone to
          <select
            onChange={e => setDestinationCategory(e.target.value)}
            value={destinationCategory || ''}
            style={styles.selectInput}
          >
            <option value="" />
            {categoriesForSelect
              .filter(c => c.environmentName === destinationEnvironment)
              .map(cat => (
                <option key={cat.key} value={cat.key}>
                  {cat.formattedName}
                </option>
              ))}
          </select>
        </label>
      )}
    </StylizedBaseDialog>
  );
}

export default function CloneProgrammingExpressionDialog({
  itemToClone,
  programmingEnvironmentsForSelect,
  categoriesForSelect,
  onClose,
}) {
  const [clonedEditUrl, setClonedEditUrl] = useState(null);

  if (clonedEditUrl) {
    return (
      <StylizedBaseDialog
        handleClose={onClose}
        renderFooter={() => (
          <FooterButton
            type="cancel"
            text={i18n.dialogOK()}
            onClick={onClose}
          />
        )}
        isOpen
      >
        <span>
          Clone succeeded! Visit{' '}
          <TextLink
            openInNewTab
            href={clonedEditUrl}
            text="the new code doc's edit page"
          />{' '}
          to make further changes.
        </span>
      </StylizedBaseDialog>
    );
  } else {
    return (
      <CloneFormDialog
        itemToClone={itemToClone}
        programmingEnvironmentsForSelect={programmingEnvironmentsForSelect}
        categoriesForSelect={categoriesForSelect}
        onClose={onClose}
        onCloneSuccess={setClonedEditUrl}
      />
    );
  }
}

CloneProgrammingExpressionDialog.propTypes = {
  itemToClone: PropTypes.object.isRequired,
  programmingEnvironmentsForSelect: PropTypes.arrayOf(PropTypes.object)
    .isRequired,
  categoriesForSelect: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
};

CloneFormDialog.propTypes = {
  itemToClone: PropTypes.object.isRequired,
  programmingEnvironmentsForSelect: PropTypes.arrayOf(PropTypes.object)
    .isRequired,
  categoriesForSelect: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
  onCloneSuccess: PropTypes.func,
};

const styles = {
  selectInput: {
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    marginBottom: 0,
    marginLeft: 5,
  },
};
