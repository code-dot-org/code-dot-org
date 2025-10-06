export interface ResponseSchemaSettings {
  jsonSchema: object;
  responseCallback: (response: string) => string | void;
}
