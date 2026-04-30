interface AddFileHandlerParams {
  fileName: string;
  getFile: () => Promise<File>;
  notifySuccess: (
    method: 'new' | 'replace' | 'rename',
    message: string
  ) => void;
  notifyError: (message: string) => void;
}
export type AddFileHandler = (
  params: AddFileHandlerParams
) => void | Promise<void>;
