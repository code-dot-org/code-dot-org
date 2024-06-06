export interface LtiUpgradeAccountForm {
  destination_url: string;
  email?: string;
}
export interface LtiUpgradeAccountDialogProps {
  formData: LtiUpgradeAccountForm;
  onClose?: () => void;
}
