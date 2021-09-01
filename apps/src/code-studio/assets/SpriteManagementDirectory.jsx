import React from 'react';

export default class SpriteManagementDirectory extends React.Component {
  render() {
    return (
      <div>
        <h1>Manage Sprite Lab Sprites</h1>
        <h3>
          <a href="/sprites/sprite_upload">Upload New Sprites</a>
        </h3>
        <h3>
          <a href="/sprites/default_sprites_editor">Edit Default Sprites</a>
        </h3>
        <h3>
          <a href="/sprites/select_start_animations">
            Select Start Animations From Library
          </a>
        </h3>
        <div>
          <h3>
            <a href="/sprites/select_start_animations?library=all">
              Select Start Animations From All Sprites
            </a>
          </h3>
          <h5>This takes a while to load, use the other link when possible</h5>
        </div>
      </div>
    );
  }
}
