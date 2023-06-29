import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Chat from '@cdo/apps/chat/Chat';
import levels from '@cdo/apps/chat/levels';

export default function loadChat(options) {
  options.isEditorless = true;
  const chat = new Chat();

  chat.injectStudioApp(studioApp());
  appMain(chat, levels, options);
}
