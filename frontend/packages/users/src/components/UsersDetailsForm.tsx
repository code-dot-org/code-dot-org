/**
 * The Account Details tab body. The individual sections (My Information,
 * Login Information, parent/guardian email, Account Actions) and the save
 * bar are wired in by later phases; this shell renders the tab panel.
 */
export default function UsersDetailsForm() {
  // Not a <form>: portaled modal submits still bubble through the React tree,
  // so a form here would catch them and fire a spurious save.
  return <div />;
}
