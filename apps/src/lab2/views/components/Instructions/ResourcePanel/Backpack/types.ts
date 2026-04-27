type GetFileResponse = {
  file: File;
  flagged?: boolean;
};

export type AddFileHandler = (
  fileName: string,
  getFile: () => Promise<GetFileResponse>,
  notifySuccess: (
    method: 'new' | 'replace' | 'rename',
    message: string
  ) => void,
  notifyError: (message: string) => void
) => void | Promise<void>;
