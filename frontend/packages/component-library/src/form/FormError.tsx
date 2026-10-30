import Alert from '@/alert';

/**
 * A form-level (non-field) error summary. Renders the DSCO `Alert` as a
 * `danger` alert, whose default `isImmediateImportance` gives it `role="alert"`
 * so it is announced when it appears; a consumer that moves focus to a wrapping
 * `tabIndex={-1}` element still gets a keyboard/SR user straight to it. Renders
 * nothing when there is no message.
 */
export default function FormError({message}: {message: string | null}) {
  if (!message) {
    return null;
  }
  return <Alert type="danger" text={message} />;
}
