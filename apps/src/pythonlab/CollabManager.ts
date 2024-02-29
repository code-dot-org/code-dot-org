import {WebsocketProvider} from 'y-websocket';
import {yCollab} from 'y-codemirror.next';
import {Extension} from '@codemirror/state';
const Y = require('yjs');

export default class CollabManager {
  private static readonly usercolors = [
    {color: '#30bced', light: '#30bced33'},
    {color: '#6eeb83', light: '#6eeb8333'},
    {color: '#ffbc42', light: '#ffbc4233'},
    {color: '#ecd444', light: '#ecd44433'},
    {color: '#ee6352', light: '#ee635233'},
    {color: '#9ac2c9', light: '#9ac2c933'},
    {color: '#8acb88', light: '#8acb8833'},
    {color: '#1be7ff', light: '#1be7ff33'},
  ];
  private static collabExtension: Extension;

  public static getExtension(): Extension {
    if (!CollabManager.collabExtension) {
      // select a random color for this user
      const userColor =
        CollabManager.usercolors[
          Math.floor(Math.random() * CollabManager.usercolors.length)
        ];
      const ydoc = new Y.Doc();
      const provider = new WebsocketProvider(
        'ws://localhost:1234',
        'my-roomname',
        ydoc
      );
      const ytext = ydoc.getText('codemirror');

      provider.awareness.setLocalStateField('user', {
        name: 'Anonymous ' + Math.floor(Math.random() * 100),
        color: userColor.color,
        colorLight: userColor.light,
      });

      const undoManager = new Y.UndoManager(ytext);
      CollabManager.collabExtension = yCollab(ytext, provider.awareness, {
        undoManager,
      });
    }
    return CollabManager.collabExtension;
  }
}
