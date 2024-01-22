import React from 'react';

export default class SpriteManagementDirectory extends React.Component {
  render() {
    return (
      <div>
        <h1>Manage Sprite Lab Assets</h1>
        <p>This is an internal set of tools for Code.org content editors.</p>
        <h2>Add/Replace Animations</h2>
        <ul>
          <li>
            <a href="/sprites/sprite_upload">Upload Animations</a>
          </li>
        </ul>
        <p>
          <br />
          Add new or replace existing costumes and backgrounds in Sprite Lab
          projects and curriculum levels.
        </p>
        <h2>Animation JSON</h2>
        <ul>
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
        </ul>
        <p>
          <br />
          For level builders. Generate Animation JSON that can be copied and
          pasted into curriculum levels.
        </p>
        <h2>Default Animations</h2>
        <ul>
          <li>
            <a href="/sprites/default_sprites_editor">
              Edit Default Costumes and Backgrounds
            </a>
          </li>
          <li>
            <a href="/sprites/release_default_sprites_to_production">
              Release Changes to Default Animations to Production
            </a>
          </li>
        </ul>
        <p>
          <br />
          Updates the default set of costumes and backgrounds featured in most
          Sprite Lab projects. 'Edit Default Costumes and Backgrounds' saves
          changes to the Default list on LevelBuilder, until you 'Release
          Changes to Default Animations to Production'.
        </p>
      </div>
    );
  }
}
