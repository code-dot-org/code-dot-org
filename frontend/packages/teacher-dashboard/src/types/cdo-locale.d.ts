// Type declaration for @cdo/locale, a webpack alias in the Studio
// host. Each key is a function returning the localised string.
declare module '@cdo/locale' {
  const i18n: {
    editAvatar: () => string;
    avatarEditDialogDescription: () => string;
    avatar: () => string;
    chooseEmoji: () => string;
    chooseColor: () => string;
    dialogCancel: () => string;
    selectAvatar: () => string;
    [key: string]: () => string;
  };
  export default i18n;
}
