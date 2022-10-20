import React from 'react';

export default class SpriteManagementDirectory extends React.Component {
  render() {
    return (
      <div>
        <h1>Manage Sprite Lab Assets</h1>
        <p>This is an internal set of tools for Code.org content authors.</p>
        <h2>New Animations</h2>
        <li>
          <a href="/sprites/sprite_upload">Upload New Animations</a>
        </li>
        <p>
          <br />
          Make new costumes and backgrounds available in Sprite Lab projects and
          curriculum levels.
        </p>
        <h2>Animation JSON</h2>
        <li>
          <a href="/sprites/select_start_animations">
            Generate Animation JSON From Library Animations only
          </a>
        </li>
        <li>
          <a href="/sprites/select_start_animations?library=all">
            Generate Animation JSON From Library AND Level-Specific Animations
          </a>{' '}
          (Slower)
        </li>
        <p>
          <br />
          For level builders. Generate Animation JSON that can be copied and
          pasted into curriculum levels.
        </p>
        <h2>Default Animations</h2>
        <li>
          <a href="/sprites/default_sprites_editor">
            Edit Default Costumes and Backgrounds
          </a>
        </li>
        <p>
          <br />
          Updates the default set of costumes and backgrounds featured in most
          Sprite Lab projects.
        </p>
      </div>
    );
  }
}
