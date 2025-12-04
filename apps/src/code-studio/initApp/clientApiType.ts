/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ClientApi {
  all: (callback: any) => void;
  create: (value: any, callback: (error: string, data: any) => void) => void;
  delete: (
    childPath: string,
    callback: (error: string, result: boolean) => void
  ) => void;
  deleteObject: (
    childPath: string,
    callback: (error: string, result: boolean) => void
  ) => void;
  fetch: (
    childPath: string,
    callback: (error: string, data: any, jqXHR: JQuery.jqXHR) => void,
    dataType?: string
  ) => void;
  update: (
    childPath: string,
    value: any,
    callback: (error: string, data: any | boolean) => void
  ) => void;
  copyAll: (
    src: string,
    dest: string,
    callback: (error: string, data: any) => void
  ) => void;
  put: (
    id: number | string,
    value: string,
    filename: string,
    callback: (error: string, data: any | boolean) => void
  ) => void;
  patchAll: (
    id: number,
    queryParams: string,
    value: string,
    callback: (error: string, data: any) => void
  ) => void;
}
