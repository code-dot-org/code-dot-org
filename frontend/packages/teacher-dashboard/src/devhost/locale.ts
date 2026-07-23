// English locale stubs for standalone dev/test. The production host
// provides @cdo/locale via its webpack alias; this file is only used
// by vitest and the Vite dev server.

const i18n = {
  editAvatar: () => 'Edit avatar',
  avatarEditDialogDescription: () =>
    'Choose an emoji and color for your section avatar.',
  avatar: () => 'Avatar',
  chooseEmoji: () => 'Choose emoji',
  chooseColor: () => 'Choose color',
  dialogCancel: () => 'Cancel',
  selectAvatar: () => 'Select avatar',
};

export default i18n;
