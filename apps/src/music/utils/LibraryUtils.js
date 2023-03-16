// Given a library, an optional set of allowedSounds, and the type of
// sounds wanted, return the subset of the library's sounds that is allowed.
// It returns the folders and sounds inside of them.

export function getAllowedLibrarySounds(library, allowedSounds, folderType) {
  const folders = library.groups[0].folders;

  // Let's just do a deep copy and then do filtering in-place.
  let foldersCopy = JSON.parse(JSON.stringify(folders));

  // Whether or not we have allowedSounds, we need to filter by type.
  foldersCopy = foldersCopy.filter(folder => folder.type === folderType);

  if (allowedSounds) {
    foldersCopy = foldersCopy.filter(folder => allowedSounds[folder.path]);

    foldersCopy.forEach(folder => {
      folder.sounds = folder.sounds.filter(sound =>
        allowedSounds[folder.path]?.includes(sound.src)
      );
    });
  }

  return foldersCopy;
}
