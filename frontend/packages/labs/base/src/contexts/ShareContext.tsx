import type {FunctionComponent, PropsWithChildren} from 'react';
import {useCallback, useState, createContext, useContext} from 'react';

/**
 * Describes the state of the share dialog.
 */
export interface ShareContent {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  libraryDialogIsOpen: boolean;
  setLibraryDialogIsOpen: (value: boolean) => void;
  showShareDialog: () => void;
  hideShareDialog: () => void;
  showLibraryCreationDialog: () => void;
  hideLibraryCreationDialog: () => void;
}

/**
 * The current lab application metadata.
 */
const ShareContext = createContext<ShareContent>({
  isOpen: false,
  setIsOpen: _ => {},
  libraryDialogIsOpen: false,
  setLibraryDialogIsOpen: _ => {},
  showShareDialog: () => {},
  hideShareDialog: () => {},
  showLibraryCreationDialog: () => {},
  hideLibraryCreationDialog: () => {},
});

/**
 * This hook returns the share dialog state.
 */
export const useShare = () => {
  return useContext(ShareContext);
};

/**
 * Holds the share state.
 */
export const ShareProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [libraryDialogIsOpen, setLibraryDialogIsOpen] =
    useState<boolean>(false);

  const showShareDialog = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const hideShareDialog = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const showLibraryCreationDialog = useCallback(() => {
    setLibraryDialogIsOpen(true);
  }, [setLibraryDialogIsOpen]);

  const hideLibraryCreationDialog = useCallback(() => {
    setLibraryDialogIsOpen(false);
  }, [setLibraryDialogIsOpen]);

  return (
    <ShareContext.Provider
      value={{
        isOpen,
        setIsOpen,
        libraryDialogIsOpen,
        setLibraryDialogIsOpen,
        showShareDialog,
        hideShareDialog,
        showLibraryCreationDialog,
        hideLibraryCreationDialog,
      }}
    >
      {children}
    </ShareContext.Provider>
  );
};

export default ShareContext;
