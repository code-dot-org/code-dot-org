import {PopUpButtonOption} from '@codebridge/PopUpButton/PopUpButtonOption';
import {ProjectFile} from '@codebridge/types';
import React, {useMemo} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {setOverrideValidations} from '@cdo/apps/lab2/lab2Redux';
import {PASSED_ALL_TESTS_VALIDATION} from '@cdo/apps/lab2/progress/constants';
import {ProjectFileType} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {setShowLockedFilesBanner} from '../redux/workspaceRedux';

import {setFileType} from './types';

interface StartModeFileDropdownOptionsProps {
  file: ProjectFile;
  projectHasValidationFile: boolean;
  setFileType: setFileType;
}

/**
 * Dropdown options for the file dropdown in start mode.
 * In start mode levelbuilders can set the file type to starter, locked starter,
 * support, or validation.
 * There can only be one validation file in a project; the option to set a file
 * as validation will only be shown if there is no validation file in the project.
 */
const StartModeFileDropdownOptions: React.FunctionComponent<
  StartModeFileDropdownOptionsProps
> = ({file, projectHasValidationFile, setFileType}) => {
  const dispatch = useAppDispatch();
  // setFileType only gets called in start mode. If we are setting a file to
  // validation or changing a validation file to a non-validation file, also
  // set the override validation to a passed all tests condition.
  // This makes it so the progress manager gets updated accordingly and
  // levelbuilders can run the new validation file and see results.
  // All files are set to starter by default, so we will catch all new validation
  // files with this method.
  const handleSetFileType = useMemo(
    () => (type: ProjectFileType) => {
      if (
        file.type === ProjectFileType.VALIDATION &&
        type !== ProjectFileType.VALIDATION
      ) {
        // If this was a validation file and we are changing it to a non-validation file,
        // remove the override validation.
        dispatch(setOverrideValidations([]));
      } else if (type === ProjectFileType.VALIDATION) {
        // If the new type is validation, use the passed all tests validation condition.
        dispatch(setOverrideValidations([PASSED_ALL_TESTS_VALIDATION]));
        // We also now want to show a banner to levelbuilders to remind them to lock any relevent start files.
        // We only show the banner for 5 seconds.
        dispatch(setShowLockedFilesBanner(true));
        setTimeout(() => dispatch(setShowLockedFilesBanner(false)), 8000);
      }
      setFileType(file.id, type);
    },
    [dispatch, setFileType, file]
  );

  const dropdownOptions = [
    {
      condition: !projectHasValidationFile,
      iconName: 'flask',
      labelText: codebridgeI18n.makeValidation(),
      clickHandler: () => handleSetFileType(ProjectFileType.VALIDATION),
    },
    {
      condition: file.type !== ProjectFileType.STARTER && file.type,
      iconName: 'eye',
      labelText: codebridgeI18n.makeStarter(),
      clickHandler: () => handleSetFileType(ProjectFileType.STARTER),
    },
    {
      condition: file.type !== ProjectFileType.SUPPORT,
      iconName: 'eye-slash',
      labelText: codebridgeI18n.makeSupport(),
      clickHandler: () => handleSetFileType(ProjectFileType.SUPPORT),
    },
    {
      condition: file.type !== ProjectFileType.LOCKED_STARTER,
      iconName: 'lock',
      labelText: codebridgeI18n.makeLockedStarter(),
      clickHandler: () => handleSetFileType(ProjectFileType.LOCKED_STARTER),
    },
  ];

  return (
    <>
      {dropdownOptions.map(
        ({condition, iconName, labelText, clickHandler}, index) =>
          condition && (
            <PopUpButtonOption
              key={index}
              iconName={iconName}
              labelText={labelText}
              clickHandler={clickHandler}
            />
          )
      )}
    </>
  );
};

export default StartModeFileDropdownOptions;
