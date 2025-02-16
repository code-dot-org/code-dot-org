// import codebridgeI18n from '@cdo/apps/codebridge/locale';
// import {MultiFileSource} from '@cdo/apps/lab2/types';
import {ProjectFile} from '@cdo/apps/lab2/types';
import {DialogType, DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import {GenericDropdownProps} from '@cdo/apps/lab2/views/dialogs/GenericDropdown';
import {BackpackContextType} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';

// import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenSaveToBackpackPromptArgsType = {
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  backpackApi: BackpackContextType;
  file: ProjectFile;
};

export const openSaveToBackpackPrompt = async ({
  dialogControl,
  backpackApi,
  file,
}: OpenSaveToBackpackPromptArgsType) => {
  backpackApi.getFileList(
    () => {
      console.log('onError');
    },
    async (filenames: string[]) => {
      console.log('filenames', filenames);
      const savedFilesInBackpack: GenericDropdownProps['items'] = filenames.map(
        filename => ({value: filename, text: filename})
      );
      console.log('savedFilesInBackpack', savedFilesInBackpack);
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericConfirmation,
        title: 'Save to backpack',
        message: `You are about to save ${file.name} to your backpack`,
      });

      if (results.type !== 'confirm') {
        return;
      }
      const fileContents = {
        name: file.name,
        contents: file.contents,
        folderId: '0',
        language: 'py',
        open: true,
        active: false,
      };
      backpackApi.savePythonlabFile(file.name, fileContents);
      console.log('results', results);
    }
  );
};

//   backpackApi.fetchFile(
//     'main.py',
//     () => {
//       console.log('onError');
//     },
//     (fileContent: unknown) => {
//       console.log('fileContent', fileContent);
//     }
//   );
// };

//   sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_OPEN_BACKPACK);
