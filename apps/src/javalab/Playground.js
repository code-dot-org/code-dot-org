import {PlaygroundSignalType} from './constants';

export default class Playground {
  constructor(onOutputMessage, onNewlineMessage, onJavabuilderMessage) {
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.onJavabuilderMessage = onJavabuilderMessage;
  }

  handleSignal(data) {
    switch (data.value) {
      case PlaygroundSignalType.RUN:
      case PlaygroundSignalType.EXIT:
      case PlaygroundSignalType.ADD_CLICKABLE_ITEM:
      case PlaygroundSignalType.ADD_IMAGE_ITEM:
      case PlaygroundSignalType.ADD_TEXT_ITEM:
      case PlaygroundSignalType.CHANGE_ITEM:
      case PlaygroundSignalType.PLAY_SOUND:
      case PlaygroundSignalType.REMOVE_ITEM:
      case PlaygroundSignalType.SET_BACKGROUND_IMAGE:
        break;
    }
  }
}
