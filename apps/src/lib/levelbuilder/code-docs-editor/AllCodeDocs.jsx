import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import ProgrammingEnvironmentsTable from './ProgrammingEnvironmentsTable';

export default function AllCodeDocs({
  programmingEnvironments,
  programmingEnvironmentsForSelect,
  categoriesForSelect
}) {
  console.log(programmingEnvironments);
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    console.log(selectedEnvironment, selectedCategory);
  }, [selectedEnvironment, selectedCategory]);

  return (
    <div>
      <select
        onChange={e => setSelectedEnvironment(e.target.value)}
        value={selectedEnvironment}
      >
        <option value="all">All IDEs</option>
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
        <option value="all">All Categories</option>
        {categoriesForSelect.map(category => (
          <option key={category.id} value={category.id}>
            {category.formattedName}
          </option>
        ))}
      </select>
      <ProgrammingEnvironmentsTable
        programmingEnvironments={programmingEnvironments}
      />
    </div>
  );
}

AllCodeDocs.propTypes = {
  programmingEnvironments: PropTypes.arrayOf(PropTypes.object),
  programmingEnvironmentsForSelect: PropTypes.arrayOf(PropTypes.object),
  categoriesForSelect: PropTypes.arrayOf(PropTypes.object)
};
