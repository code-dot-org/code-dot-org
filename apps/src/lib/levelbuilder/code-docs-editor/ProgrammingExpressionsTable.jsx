import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import * as Table from 'reactabular-table';
import queryString from 'query-string';
import Button from '@cdo/apps/templates/Button';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import PaginationWrapper from '@cdo/apps/templates/PaginationWrapper';
import CloneProgrammingExpressionDialog from './CloneProgrammingExpressionDialog';

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

  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(null);

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

  const fetchExpressions = (environmentId, categoryId, callback) => {
    const data = {};
    if (environmentId !== ALL_VALUE) {
      data.programmingEnvironmentId = environmentId;
    }
    if (categoryId !== ALL_VALUE) {
      data.categoryId = categoryId;
    }
    data.page = currentPage;
    const url =
      '/programming_expressions/get_filtered_expressions?' +
      queryString.stringify(data);
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setProgrammingExpressions(data.expressions);
        setNumPages(data.numPages);
        if (callback) {
          callback();
        }
      });
  };

  useEffect(() => {
    fetchExpressions(selectedEnvironment, selectedCategory, () =>
      setCurrentPage(1)
    );
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
    fetchExpressions(selectedEnvironment, categoryToFetch, () =>
      setCurrentPage(1)
    );
  }, [selectedEnvironment]);

  useEffect(() => {
    fetchExpressions(selectedEnvironment, selectedCategory);
  }, [currentPage]);

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
      <PaginationWrapper
        totalPages={numPages}
        currentPage={currentPage}
        onChangePage={setCurrentPage}
      />
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
        <CloneProgrammingExpressionDialog
          itemToClone={itemToClone}
          programmingEnvironmentsForSelect={programmingEnvironmentsForSelect}
          categoriesForSelect={categoriesForSelect}
          onClose={() => {
            setItemToClone(null);
            fetchExpressions();
          }}
        />
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
