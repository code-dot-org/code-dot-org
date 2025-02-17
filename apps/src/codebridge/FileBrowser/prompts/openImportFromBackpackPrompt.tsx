// import codebridgeI18n from '@cdo/apps/codebridge/locale';
// import {MultiFileSource} from '@cdo/apps/lab2/types';
import {NewFileFunction} from '@codebridge/codebridgeContext/types';

import {
  DialogType,
  DialogControlInterface,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {GenericDropdownProps} from '@cdo/apps/lab2/views/dialogs/GenericDropdown';
import {BackpackContextType} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
// import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type OpenImportFromBackpackPromptArgsType = {
  dialogControl: Pick<DialogControlInterface, 'showDialog'>;
  backpackApi: BackpackContextType;
  newFile: NewFileFunction;
};

export const openImportFromBackpackPrompt = async ({
  dialogControl,
  backpackApi,
  newFile,
}: OpenImportFromBackpackPromptArgsType) => {
  backpackApi.getFileList(
    () => {
      console.log('onError');
    },
    async (filenames: string[]) => {
      console.log('filenames', filenames);
      const savedFilesInBackpack: GenericDropdownProps['items'] = filenames.map(
        filename => ({value: filename, text: filename})
      );
      const results = await dialogControl?.showDialog({
        type: DialogType.GenericDropdown,
        title: 'Files Saved in Backpack',
        dropdownLabel: '',
        confirmText: 'Import',
        items: savedFilesInBackpack,
        selectedValue: savedFilesInBackpack[0].value,
        neutralText: 'Delete file from backpack',
      });

      if (results.type === 'cancel') {
        return;
      }
      const selectedBackpackFileName = extractUserInput(results, true);
      if (results.type === 'confirm') {
        backpackApi.fetchFile(
          selectedBackpackFileName,
          () => {
            console.log('fetchFile - onError');
          },
          (fileContent: string) => {
            console.log('fileContent', fileContent);
            newFile({
              fileName: selectedBackpackFileName,
              contents: fileContent,
            });
          }
        );
      } else if (results.type === 'neutral') {
        console.log('delete file from backpack');
        backpackApi.deleteFiles(
          [selectedBackpackFileName],
          () => console.log('deleteFiles - onError'),
          () => console.log(`deleted file ${selectedBackpackFileName}`)
        );
      }
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
