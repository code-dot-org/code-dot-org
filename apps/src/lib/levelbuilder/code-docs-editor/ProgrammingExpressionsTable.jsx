import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import * as Table from 'reactabular-table';
import queryString from 'query-string';
import Button from '@cdo/apps/templates/Button';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';

const ALL_VALUE = 'all';

const destroyExpression = (destroyPath, callback) => {
  fetch(destroyPath, {
    method: 'DELETE',
    headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')}
  }).then(response => {
    if (response.ok) {
      callback();
    } else {
      console.log(response.error);
    }
  });
};

const cloneExpression = (
  clonePath,
  destinationEnvironmentName,
  destinationCategoryKey,
  successCallback,
  errorCallback
) => {
  fetch(clonePath, {
    method: 'POST',
    headers: {
      'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      destinationProgrammingEnvironmentName: destinationEnvironmentName,
      destinationCategoryKey: destinationCategoryKey
    })
  }).then(response => {
    if (response.ok) {
      successCallback();
    } else {
      console.log(response.error);
      errorCallback(response.statusText);
    }
  });
};

export default function ProgrammingExpressionsTable({
  programmingEnvironmentsForSelect,
  categoriesForSelect,
  hidden
}) {
  const [selectedEnvironment, setSelectedEnvironment] = useState(ALL_VALUE);
  const [selectedCategory, setSelectedCategory] = useState(ALL_VALUE);
  const [programmingExpressions, setProgrammingExpressions] = useState([]);
  const [
    categoriesAvailableForSelect,
    setCategoriesAvailableForSelect
  ] = useState(categoriesForSelect);
  const [itemToClone, setItemToClone] = useState(null);
  const [
    cloneEnvironmentDestination,
    setCloneEnvironmentDestination
  ] = useState(null);
  const [cloneCategoryDestination, setCloneCategoryDestination] = useState(
    null
  );
  const [cloneError, setCloneError] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const actionsCellFormatter = (actions, {rowData}) => {
    return (
      <div style={styles.actionsColumn}>
        <Button
          icon="edit"
          text=""
          href={rowData.editPath}
          target="_blank"
          __useDeprecatedTag
          color="teal"
        />
        <Button
          onClick={() => setItemToClone(rowData)}
          text=""
          icon="clone"
          color="gray"
          style={{margin: 0}}
        />
        <Button
          onClick={() => setItemToDelete(rowData)}
          text=""
          icon="trash"
          color="red"
          style={{margin: 0}}
        />
      </div>
    );
  };

  const fetchExpressions = (environmentId, categoryId) => {
    const data = {};
    if (environmentId !== ALL_VALUE) {
      data.programmingEnvironmentId = environmentId;
    }
    if (categoryId !== ALL_VALUE) {
      data.categoryId = categoryId;
    }
    const url =
      '/programming_expressions/get_filtered_expressions?' +
      queryString.stringify(data);
    fetch(url)
      .then(response => response.json())
      .then(data => setProgrammingExpressions(data.expressions));
  };

  useEffect(() => {
    fetchExpressions(selectedEnvironment, selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    let categoryToFetch = selectedCategory;
    if (selectedEnvironment === ALL_VALUE) {
      setCategoriesAvailableForSelect(categoriesForSelect);
    } else {
      setCategoriesAvailableForSelect(
        categoriesForSelect.filter(
          cat => String(cat.envId) === selectedEnvironment
        )
      );
      if (String(selectedCategory.envId) !== selectedEnvironment) {
        setSelectedCategory(ALL_VALUE);
        categoryToFetch = ALL_VALUE;
      }
    }
    fetchExpressions(selectedEnvironment, categoryToFetch);
  }, [selectedEnvironment]);

  const getColumns = () => {
    return [
      {
        property: 'actions',
        header: {
          label: 'Actions',
          props: {
            style: {width: '10%'}
          }
        },
        cell: {
          formatters: [actionsCellFormatter]
        }
      },

      {
        property: 'name',
        header: {
          label: 'Name'
        }
      },
      {
        property: 'environmentTitle',
        header: {
          label: 'IDE'
        }
      },
      {
        property: 'categoryName',
        header: {
          label: 'Category'
        }
      }
    ];
  };
  if (hidden) {
    return null;
  }
  return (
    <>
      <select
        onChange={e => setSelectedEnvironment(e.target.value)}
        value={selectedEnvironment}
      >
        <option value={ALL_VALUE}>All IDEs</option>
        {programmingEnvironmentsForSelect.map(env => (
          <option key={env.id} value={env.id}>
            {env.title}
          </option>
        ))}
      </select>
      <select
        onChange={e => setSelectedCategory(e.target.value)}
        value={selectedCategory}
      >
        <option value={ALL_VALUE}>All Categories</option>
        {categoriesAvailableForSelect.map(category => (
          <option key={category.id} value={category.id}>
            {category.formattedName}
          </option>
        ))}
      </select>
      <Table.Provider columns={getColumns()} style={{width: '100%'}}>
        <Table.Header />
        <Table.Body rows={programmingExpressions} rowKey="id" />
      </Table.Provider>
      {!!itemToDelete && (
        <StylizedBaseDialog
          body={`Are you sure you want to remove ${
            itemToDelete.name
          } and its associated code doc?`}
          handleConfirmation={() => {
            destroyExpression(
              `/programming_expressions/${itemToDelete.id}`,
              () => {
                setItemToDelete(null);
                fetchExpressions();
              }
            );
          }}
          handleClose={() => setItemToDelete(null)}
          isOpen
        />
      )}
      {!!itemToClone && (
        <StylizedBaseDialog
          handleConfirmation={() => {
            cloneExpression(
              `/programming_expressions/${itemToClone.id}/clone`,
              cloneEnvironmentDestination,
              cloneCategoryDestination,
              () => {
                setItemToClone(null);
                setCloneEnvironmentDestination(null);
                setCloneCategoryDestination(null);
                setCloneError(null);
              },
              err => {
                setCloneError(err);
              }
            );
          }}
          handleClose={() => setItemToClone(null)}
          isOpen
        >
          <h3>{`Cloning "${itemToClone.key}"`}</h3>
          {cloneError && <div style={{color: 'red'}}>{cloneError}</div>}
          <label>
            IDE to clone to
            <select
              onChange={e => setCloneEnvironmentDestination(e.target.value)}
              value={cloneEnvironmentDestination || ''}
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
          {cloneEnvironmentDestination && (
            <label>
              Category to clone to
              <select
                onChange={e => setCloneCategoryDestination(e.target.value)}
                value={cloneCategoryDestination || ''}
              >
                <option value="" />
                {categoriesForSelect
                  .filter(c => c.envName === cloneEnvironmentDestination)
                  .map(cat => (
                    <option key={cat.key} value={cat.key}>
                      {cat.formattedName}
                    </option>
                  ))}
              </select>
            </label>
          )}
        </StylizedBaseDialog>
      )}
    </>
  );
}

ProgrammingExpressionsTable.propTypes = {
  programmingEnvironmentsForSelect: PropTypes.arrayOf(PropTypes.object)
    .isRequired,
  categoriesForSelect: PropTypes.arrayOf(PropTypes.object).isRequired,
  hidden: PropTypes.bool
};

const styles = {
  actionsColumn: {
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: 'white'
  }
};
