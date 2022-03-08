import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import * as Table from 'reactabular-table';
import {TextLink} from '@dsco_/link';
import queryString from 'query-string';

const ALL_VALUE = 'all';

const actionsCellFormatter = (actions, {rowData}) => {
  return (
    <div style={styles.actionsColumn}>
      <TextLink icon={<i className="fa fa-edit" />} href={rowData.editPath} />
      <TextLink
        icon={<i className="fa fa-trash" />}
        href={rowData.destroyPath}
      />
    </div>
  );
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

  const fetchExpressions = (environmentId, categoryId) => {
    console.log(environmentId, categoryId);
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
