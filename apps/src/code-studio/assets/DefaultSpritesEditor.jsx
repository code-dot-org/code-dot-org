import React from 'react';

export default class DefaultSpritesEditor extends React.Component {
  render() {
    return (
      <div>
        <a href="/sprites">Back to Sprite Management</a>
        <h1>Edit Default Sprites</h1>
        <h2>
          Edit the list to add or remove sprites from the default dropdown list
          in Sprite Lab
        </h2>
        <div>
          <textarea name="default_sprites" cols="100" rows="10" />
        </div>
        <button type="button" onClick={console.log('Update defaults')}>
          Update Default Sprites List
        </button>
      </div>
    );
  }
}
