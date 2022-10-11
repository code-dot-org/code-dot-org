import React from 'react';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import {
  getDefaultListMetadata,
  moveDefaultSpriteMetadataToProduction
} from '@cdo/apps/assetManagement/animationLibraryApi';

export default class ReleaseDefaultSprites extends React.Component {
  state = {
    levelbuilderDefaultList: [], // Array of name/category sprite objects
    productionDefaultList: []
  };

  componentDidMount() {
    getDefaultListMetadata('levelbuilder')
      .then(spriteDefault => {
        let orderedKeys = spriteDefault['orderedKeys'];
        let propsByKey = spriteDefault['propsByKey'];
        let orderedList = [];
        orderedKeys.map(key => {
          orderedList.push(propsByKey[key]);
        });
        this.setState({levelbuilderDefaultList: orderedList});
      })
      .catch(err => {
        console.log(err);
      });
    getDefaultListMetadata('production')
      .then(spriteDefault => {
        let orderedKeys = spriteDefault['orderedKeys'];
        let propsByKey = spriteDefault['propsByKey'];
        let orderedList = [];
        orderedKeys.map(key => {
          orderedList.push(propsByKey[key]);
        });
        this.setState({productionDefaultList: orderedList});
      })
      .catch(err => {
        console.log(err);
      });
  }

  confirmReleaseChangesToLevelbuilder = () => {
    let shouldRelease = confirm(
      'This will release any changes to the default sprite list to ' +
        'production. Are you sure?'
    );
    if (shouldRelease) {
      this.moveChangesToProduction();
    }
  };

  moveChangesToProduction = () => {
    //Files to move to production folder: defaultSprites.json
    moveDefaultSpriteMetadataToProduction().catch(err => {
      console.log(err);
    });
  };

  render() {
    return (
      <div>
        <a href="/sprites">Back to Asset Management</a>
        <h1>Release Default Sprites from Levelbuilder to Production</h1>
        <p>
          If you made changes to the list of default sprites on this
          <a href="/sprites/default_sprites_editor"> tool</a>, those changes are
          saved only to the levelbuilder environment. By pressing this button,
          those changes will be sent to production and become available to
          students immediately.
        </p>
        <Button
          text="Release Changes to Production"
          color={Button.ButtonColor.red}
          onClick={this.confirmReleaseChangesToLevelbuilder}
          style={styles.button}
        />
        <h3>Review The Changes</h3>
        <p>
          You can test these changes in a Sprite Lab project on Levelbuilder
        </p>
        <p>
          Below is the current levelbuilder default sprite list and the current
          default sprite list on production.
        </p>
        <div style={styles.pageBreak}>
          <div style={styles.column}>
            <h3>List To Deploy</h3>
            {this.state.levelbuilderDefaultList.map(spriteObject => {
              return (
                <p key={spriteObject.name} style={styles.listItem}>
                  {spriteObject.name}
                </p>
              );
            })}
          </div>
          <div style={styles.column}>
            <h3>List Already on Production</h3>
            {this.state.productionDefaultList.map(spriteObject => {
              return (
                <p key={spriteObject.name} style={styles.listItem}>
                  {spriteObject.name}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  pageBreak: {
    borderTop: `1px solid ${color.dark_slate_gray}`,
    display: 'flex',
    alignItems: 'start'
  },
  button: {
    margin: 20,
    fontSize: 20
  },
  column: {
    float: 'left',
    width: '50%',
    border: `1px solid ${color.dark_slate_gray}`
  },
  listItem: {
    borderTop: `1px solid ${color.dark_slate_gray}`,
    marginTop: '5px',
    marginBottom: '5px',
    fontSize: 20
  }
};
