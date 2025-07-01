import MusicLibrary from '../../player/MusicLibrary';
import {EditorType} from '../../utils/Tunes';

export function getInstruments(editorType: EditorType) {
  if (editorType === 'drums') {
    return MusicLibrary.getInstance()?.kits || [];
  }
  return MusicLibrary.getInstance()?.instruments || [];
}
