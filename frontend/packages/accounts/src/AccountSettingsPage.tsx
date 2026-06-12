export interface AccountSettingsPageProps {
  /** Active tab id, supplied by the host (see design D11). */
  tab?: string;
  /** Called when the user selects a different tab (see design D11). */
  onTabChange?: (tab: string) => void;
}

/**
 * The "My Account" Account Details page. The sections, save bar, and modals
 * are built in task group 5; this is the package-shape placeholder so the
 * Studio host can lazy-load the default export.
 */
export default function AccountSettingsPage({tab}: AccountSettingsPageProps) {
  return (
    <main aria-label="My Account">
      <p>Account settings — coming soon.{tab ? ` (tab: ${tab})` : ''}</p>
    </main>
  );
}
