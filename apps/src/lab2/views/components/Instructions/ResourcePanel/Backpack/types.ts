export type AddFileHandler = (
  fileName: string,
  getFile: () => Promise<File>,
  notifySuccess: (
    method: 'new' | 'replace' | 'rename',
    message: string
  ) => void,
  notifyError: (message: string) => void
) => void | Promise<void>;
