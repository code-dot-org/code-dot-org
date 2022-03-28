import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import color from '@cdo/apps/util/color';

export const CategoryNavigation = ({initialIsOpen, category}) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen || false);
  return (
    <div
      style={{
        backgroundColor: isOpen ? category.color : color.lightest_gray
      }}
      className={classNames({category: true, open: isOpen})}
    >
      <span className="title" onClick={() => setIsOpen(!isOpen)}>
        {category.name}
      </span>
      {category.content}
    </div>
  );
};

const categoryShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  content: PropTypes.node,
  color: PropTypes.string
});

CategoryNavigation.propTypes = {
  initialIsOpen: PropTypes.bool,
  category: categoryShape.isRequired
};

export default function NavigationBar({categories, initialCategoryKey}) {
  return (
    <div className="nav-bar header">
      {categories.map(category => (
        <CategoryNavigation
          key={category.key}
          category={category}
          initialIsOpen={
            initialCategoryKey && category.key === initialCategoryKey
          }
        />
      ))}
    </div>
  );
}

NavigationBar.propTypes = {
  categories: PropTypes.arrayOf(categoryShape).isRequired,
  initialCategoryKey: PropTypes.string
};
