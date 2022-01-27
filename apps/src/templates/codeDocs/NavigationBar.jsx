import React from 'react';
import CategoryNavigation from './CategoryNavigation';

export default function NavigationBar() {
  return (
    <div style={styles.header}>
      <CategoryNavigation
        name="Canvas"
        initialIsOpen
        color="#F78183"
        links={[
          {
            name: 'createCanvas',
            href: 'https://curriculum.code.org/docs/applab/createCanvas/'
          },
          {
            name: 'getRed',
            href: 'https://curriculum.code.org/docs/applab/getRed/'
          }
        ]}
      />
      <CategoryNavigation
        name="Turtle"
        initialIsOpen={false}
        color="#4DD0E1"
        links={[
          {name: 'move', href: 'https://curriculum.code.org/docs/applab/move/'},
          {
            name: 'penUp',
            href: 'https://curriculum.code.org/docs/applab/penUp/'
          }
        ]}
      />
    </div>
  );
}

const styles = {
  header: {
    position: 'absolute',
    width: 200,
    left: 0
  }
};
