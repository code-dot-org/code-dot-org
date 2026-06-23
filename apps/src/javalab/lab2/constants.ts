import {ProjectSources} from '@cdo/apps/lab2/types';

export const MAIN_JAVA_FILE = 'Main.java';

export const DEFAULT_PROJECT: ProjectSources = {
  source: {
    files: {
      '0': {
        id: '0',
        name: MAIN_JAVA_FILE,
        contents:
          'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello world!");\n  }\n}\n',
        folderId: '0',
        active: true,
      },
    },
    folders: {},
    openFiles: ['0'],
  },
};

export const JAVALAB_EDITABLE_FILE_TYPES = ['java', 'txt', 'csv', 'json'];

// Media types must be accepted by both upload endpoints:
// LevelStarterAssetsController::VALID_FILE_EXTENSIONS (start mode) and
// AssetBucket#allowed_file_types (student projects).
export const JAVALAB_IMAGE_FILE_TYPES = ['png', 'jpg', 'jpeg', 'gif'];
export const JAVALAB_AUDIO_FILE_TYPES = ['wav', 'mp3'];
export const JAVALAB_MEDIA_FILE_TYPES = [
  ...JAVALAB_IMAGE_FILE_TYPES,
  ...JAVALAB_AUDIO_FILE_TYPES,
];

// Media types are uploadable but stay out of JAVALAB_EDITABLE_FILE_TYPES,
// which feeds the new-file dialog's extension dropdown — users shouldn't
// create empty .png files.
export const JAVALAB_SUPPORTED_FILE_TYPES = [
  ...JAVALAB_EDITABLE_FILE_TYPES,
  ...JAVALAB_MEDIA_FILE_TYPES,
];
