export type GetResponse<ResponseType> = {
  value: ResponseType;
  response: Response;
};

/**
 * This describes a function that validates a JSON record.
 *
 * When a validation fails, it throws a ValidationError.
 */
export type ResponseValidator<ResponseType> = (
  bodyJson: Record<string, unknown> | unknown[]
) => ResponseType;

// Partial definition of the App Options structure, only defining the
// pieces we need in this component.
export interface PartialAppOptions {
  channel: string;
  editBlocks: string;
  levelId: number;
  share: boolean;
  isEditingExemplar: boolean;
  isViewingExemplar: boolean;
  publicCaching: boolean;
  theme?: string;
}
