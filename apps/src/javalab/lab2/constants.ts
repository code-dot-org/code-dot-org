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

export const JAVALAB_SUPPORTED_FILE_TYPES = JAVALAB_EDITABLE_FILE_TYPES;
