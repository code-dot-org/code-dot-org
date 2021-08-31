import React from 'react';
import {
  getManifest,
  getLevelAnimationsFiles
} from '@cdo/apps/assetManagement/animationLibraryApi';
import Button from '@cdo/apps/templates/Button';

export default class SelectStartAnimations extends React.Component {
  state = {
    spritesByCategory: {},
    startAnimations: [],
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
          updatedCategories['level_animations'] = onlyPngs;
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

  onAddSprite = sprite => {
    let updatedSprites = [...this.state.startAnimations];
    updatedSprites.push(sprite);
    this.setState({startAnimations: updatedSprites});
  };

  displayExpandedCategory = () => {
    const {spritesByCategory, expandedCategory} = this.state;
    let category = spritesByCategory[expandedCategory];
    if (!category) {
      return;
    }

    return category.map(sprite => {
      return (
        <div style={styles.addButtons}>
          <Button
            color={Button.ButtonColor.gray}
            onClick={() => this.onAddSprite(sprite)}
            size={Button.ButtonSize.narrow}
            icon="plus"
            iconClassName="fa-plus"
          />
          <p>{sprite}</p>
        </div>
      );
    });
  };

  displaySelectedSprites = () => {
    const {startAnimations} = this.state;
    return startAnimations.map(animation => {
      return <p>{animation}</p>;
    });
  };

  render() {
    return (
      <div>
        <h3>Select Starting Animations</h3>
        <div style={styles.categoryRows}>
          <div>
            <h3>Categories:</h3>
            {this.renderCategories()}
          </div>

          <div>
            <h3>Add Animations:</h3>
            {this.displayExpandedCategory()}
          </div>

          <div>
            <h3>Selected Animations:</h3>
            {this.displaySelectedSprites()}
          </div>
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
  },
  addButtons: {
    display: 'flex',
    justifyContent: 'flex-start'
  }
};
