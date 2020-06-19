import i18n from '@cdo/locale';

export const findDropletParseErrors = (dropletEditor, errorCallback) => {
  if (!dropletEditor) {
    return;
  }

  try {
    dropletEditor.parse();
  } catch (error) {
    // error.message = Line ###. Error Message
    let matchedLineNumber = error.message.match(/Line (\d+)./);
    if (matchedLineNumber) {
      errorCallback(
        Number(matchedLineNumber[1]) + 1,
        i18n.droplet_parsing_error()
      );
      return true;
    }
  }
};
