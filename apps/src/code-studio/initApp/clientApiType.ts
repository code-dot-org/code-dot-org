// We are allowing any in this interface to make this usable in TypeScript, as the clientApi
// could return many different object types.
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ClientApi {
  all: (callback: any) => void;
  create: (value: any, callback: (error: Error, data: any) => void) => void;
  delete: (
    childPath: string,
    callback: (error: Error, result: boolean) => void
  ) => void;
  deleteObject: (
    childPath: string,
    callback: (error: Error, result: boolean) => void
  ) => void;
  fetch: (
    childPath: string | null,
    callback: (error: Error, data: any, jqXHR: JQuery.jqXHR) => void,
    dataType?: string
  ) => void;
  update: (
    childPath: string | null,
    value: any,
    callback: (error: Error, data: any | boolean) => void
  ) => void;
  copyAll: (
    src: string,
    dest: string,
    callback: (error: Error, data: any) => void
  ) => void;
  put: (
    id: number | string | null,
    value: string,
    filename: string,
    callback: (error: Error, data: any | boolean) => void
  ) => void;
  patchAll: (
    id: number,
    queryParams: string,
    value: string,
    callback: (error: Error, data: any) => void
  ) => void;
}
