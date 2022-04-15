import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import * as Table from 'reactabular-table';
import queryString from 'query-string';
import Button from '@cdo/apps/templates/Button';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import PaginationWrapper from '@cdo/apps/templates/PaginationWrapper';
import CloneProgrammingExpressionDialog from './CloneProgrammingExpressionDialog';

const DEFAULT_VALUE = 'all';

/*
 * A component that fetches programming expressions and displays them in a
 * table. It includes filters for which expressions are fetched as well as the
 * ability to destroy and clone expressions.
 * This is a levelbuilder-facing component.
 */
export default function ProgrammingExpressionsTable({
  allProgrammingEnvironments,
  allCategories,
  hidden
}) {
  const [selectedEnvironment, setSelectedEnvironment] = useState(DEFAULT_VALUE);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_VALUE);
  const [programmingExpressions, setProgrammingExpressions] = useState([]);
  const [
    categoriesAvailableForSelect,
    setCategoriesAvailableForSelect
  ] = useState(allCategories);
  const [itemToClone, setItemToClone] = useState(null);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [error, setError] = useState(null);

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

  const fetchExpressions = (environmentId, categoryId, page) => {
    const data = {};
    if (environmentId !== DEFAULT_VALUE) {
      data.programmingEnvironmentId = environmentId;
    }
    if (categoryId !== DEFAULT_VALUE) {
      data.categoryId = categoryId;
    }
    data.page = page;
    const url =
      '/programming_expressions/get_filtered_expressions?' +
      queryString.stringify(data);
    let success = false;
    fetch(url)
      .then(response => {
        if (response.ok) {
          success = true;
        } else {
          setError(response.statusText);
        }
        return response.json();
      })
      .then(data => {
        if (success) {
          setProgrammingExpressions(data.expressions);
          setNumPages(data.numPages);
        }
      })
      .catch(error => {
        setError(error);
      });
  };

  const destroyExpression = (destroyPath, callback) => {
    fetch(destroyPath, {
      method: 'DELETE',
      headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')}
    }).then(response => {
      if (response.ok) {
        setItemToDelete(null);
        fetchExpressions(selectedEnvironment, selectedCategory, currentPage);
      } else {
        setError(response.statusText);
      }
    });
  };

  useEffect(() => {
    fetchExpressions(selectedEnvironment, selectedCategory, currentPage);
  }, [selectedEnvironment, selectedCategory, currentPage]);

  const onEnvironmentSelect = e => {
    const newSelectedEnvironment = e.target.value;
    setSelectedEnvironment(newSelectedEnvironment);
    if (newSelectedEnvironment === DEFAULT_VALUE) {
      setCategoriesAvailableForSelect(allCategories);
    } else {
      setCategoriesAvailableForSelect(
        allCategories.filter(
          cat => String(cat.environmentId) === String(newSelectedEnvironment)
        )
      );
      if (String(selectedCategory.environmentId) !== newSelectedEnvironment) {
        setSelectedCategory(DEFAULT_VALUE);
      }
    }
    setCurrentPage(1);
  };

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

  const renderFilters = () => {
    return (
      <>
        <select
          onChange={onEnvironmentSelect}
          value={selectedEnvironment}
          style={{marginRight: 7}}
        >
          <option value={DEFAULT_VALUE}>All IDEs</option>
          {allProgrammingEnvironments.map(env => (
            <option key={env.id} value={env.id}>
              {env.title || env.name}
            </option>
          ))}
        </select>
        <select
          onChange={e => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          value={selectedCategory}
        >
          <option value={DEFAULT_VALUE}>All Categories</option>
          {categoriesAvailableForSelect.map(category => (
            <option key={category.id} value={category.id}>
              {category.formattedName}
            </option>
          ))}
        </select>
      </>
    );
  };

  const renderDialogs = () => {
    return (
      <>
        {!!itemToDelete && (
          <StylizedBaseDialog
            body={`Are you sure you want to remove ${itemToDelete.name ||
              itemToDelete.key} and its associated code doc?`}
            handleConfirmation={() => {
              destroyExpression(
                `/programming_expressions/${itemToDelete.id}`,
                () => {
                  setItemToDelete(null);
                  fetchExpressions(
                    selectedEnvironment,
                    selectedCategory,
                    currentPage
                  );
                }
              );
            }}
            handleClose={() => setItemToDelete(null)}
            isOpen
          />
        )}
        {!!itemToClone && (
          <CloneProgrammingExpressionDialog
            itemToClone={itemToClone}
            programmingEnvironmentsForSelect={allProgrammingEnvironments}
            categoriesForSelect={allCategories}
            onClose={() => {
              setItemToClone(null);
              fetchExpressions(
                selectedEnvironment,
                selectedCategory,
                currentPage
              );
            }}
          />
        )}
      </>
    );
  };

  if (hidden) {
    return null;
  }
  return (
    <>
      {renderFilters()}
      {error && <div>{error}</div>}
      <Table.Provider columns={getColumns()} style={{width: '100%'}}>
        <Table.Header />
        <Table.Body rows={programmingExpressions} rowKey="id" />
      </Table.Provider>
      <PaginationWrapper
        totalPages={numPages}
        currentPage={currentPage}
        onChangePage={setCurrentPage}
      />
      {renderDialogs()}
    </>
  );
}

ProgrammingExpressionsTable.propTypes = {
  allProgrammingEnvironments: PropTypes.arrayOf(PropTypes.object).isRequired,
  allCategories: PropTypes.arrayOf(PropTypes.object).isRequired,
  hidden: PropTypes.bool
};

const styles = {
  actionsColumn: {
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: 'white'
  }
};
