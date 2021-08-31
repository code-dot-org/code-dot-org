import React from 'react';
import {
  getManifest,
  getLevelAnimationsFiles
} from '@cdo/apps/assetManagement/animationLibraryApi';

export default class SelectStartAnimations extends React.Component {
  state = {
    spritesByCategory: {},
    startAnimations: {},
    expandedCategory: ''
  };

  componentDidMount() {
    getManifest('spritelab')
      .then(sprites => {
        // let orderedList = Array.from(spriteDefault['default_sprites']);
        // this.setState({defaultList: orderedList, isLoading: false});
        const categories = sprites['categories'];
        this.setState({spritesByCategory: categories});
      })
      .then(() => {
        getLevelAnimationsFiles().then(sprites => {
          let updatedCategories = {...this.state.spritesByCategory};
          let onlyPngs = sprites.files.filter(filename => {
            let lowercase = filename.toLowerCase();
            return lowercase.endsWith('png');
          });
          updatedCategories['hidden'] = onlyPngs;
          this.setState({spritesByCategory: updatedCategories});
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  expandCategory = category => {
    this.setState({expandedCategory: category});
  };

  renderCategories = () => {
    const categories = Object.keys(this.state.spritesByCategory);
    return categories.map(category => {
      return (
        <div key={category}>
          <h5>
            <a onClick={() => this.expandCategory(category)}>{category}</a>
          </h5>
        </div>
      );
    });
  };

  renderSpecificCategory = category => {
    const sprites = this.state.spritesByCategory[category];
    return sprites.map(sprite => {
      return <p key={sprite}>{sprite}</p>;
    });
  };

  displayExpandedCategory = () => {
    const {spritesByCategory, expandedCategory} = this.state;
    let category = spritesByCategory[expandedCategory];
    if (!category) {
      return;
    }

    return category.map(sprite => {
      return <p key={sprite}>{sprite}</p>;
    });
  };

  render() {
    return (
      <div>
        <h3>Select Starting Animations</h3>
        <div style={styles.categoryRows}>
          <div>{this.renderCategories()}</div>

          <div>{this.displayExpandedCategory()}</div>
        </div>
      </div>
    );
  }
}

const styles = {
  categoryRows: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  }
};
