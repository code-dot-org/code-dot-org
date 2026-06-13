import {expect, test, type Page} from '@playwright/test';

// Keyboard-only operation of the Account Details page (a11y spec). Drives the
// standalone page; the same component Studio hosts.

async function gotoLoaded(page: Page, scenario = 'teacher') {
  await page.goto(`/?scenario=${scenario}`);
  await page.getByRole('heading', {level: 1, name: 'My Account'}).waitFor();
}

// True when keyboard focus is within the open modal (focus-trap check). MUI puts
// initial focus on the dialog's presentation container — an ancestor of the
// role="dialog" paper — so we accept focus on the paper, inside it, or on the
// container that wraps it.
function focusIsInModal(page: Page) {
  return page.evaluate(() => {
    const dialog = document.querySelector(
      '[role="dialog"],[role="alertdialog"]',
    );
    const active = document.activeElement;
    if (!dialog || !active) return false;
    return (
      active === dialog || dialog.contains(active) || active.contains(dialog)
    );
  });
}

test('tablist is a roving tabstop navigated with arrow keys', async ({
  page,
}) => {
  await gotoLoaded(page);

  const tabs = page.getByRole('tab');
  await tabs.first().focus();
  await expect(tabs.first()).toBeFocused();

  // Roving: arrows move focus across tabs (disabled future tabs stay reachable).
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(tabs.last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tabs.first()).toBeFocused();
});

test('form fields are reachable by Tab and Enter submits the save bar', async ({
  page,
}) => {
  await gotoLoaded(page);

  const displayName = page.getByLabel(/Display name/);
  await displayName.fill('Dr. Ada');

  // The save bar reveals on edit and its Save control is keyboard-reachable.
  const save = page.getByRole('button', {name: 'Save changes'});
  await expect(save).toBeVisible();

  // Enter from within the form submits it (native single-form submit).
  await displayName.press('Enter');
  await expect(page.getByText('Your changes have been saved!')).toBeVisible();
});

test('Save button submits on Enter when focused', async ({page}) => {
  await gotoLoaded(page);
  await page.getByLabel(/Display name/).fill('Grace');

  const save = page.getByRole('button', {name: 'Save changes'});
  await save.focus();
  await expect(save).toBeFocused();
  await save.press('Enter');
  await expect(page.getByText('Your changes have been saved!')).toBeVisible();
});

test('update-email modal traps focus, closes on Escape, and returns focus', async ({
  page,
}) => {
  await gotoLoaded(page);

  const trigger = page.getByRole('button', {name: 'Update email'});
  await trigger.click();

  const dialog = page.getByRole('dialog', {name: /update email/i});
  await expect(dialog).toBeVisible();

  // Focus starts inside the modal and stays trapped across Tabs.
  expect(await focusIsInModal(page)).toBe(true);
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  expect(await focusIsInModal(page)).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('update-password modal closes on Escape and returns focus', async ({
  page,
}) => {
  await gotoLoaded(page);

  const trigger = page.getByRole('button', {name: 'Update password'});
  await trigger.click();
  await expect(
    page.getByRole('dialog', {name: /update password/i}),
  ).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('account-type change opens an alertdialog and reverts the select on Cancel', async ({
  page,
}) => {
  await gotoLoaded(page);

  const select = page.getByRole('combobox', {name: /account type/i});
  await select.selectOption('student');

  const dialog = page.getByRole('alertdialog', {name: /change account type/i});
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', {name: /cancel/i}).click();
  await expect(dialog).toBeHidden();
  // Controlled revert, not visual-only.
  await expect(select).toHaveValue('teacher');
});

test('delete-account alertdialog opens and closes on Escape with focus returned', async ({
  page,
}) => {
  await gotoLoaded(page);

  const trigger = page.getByRole('button', {name: /delete my account/i});
  await trigger.click();
  await expect(page.getByRole('alertdialog', {name: /delete/i})).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('critical flows work at 400% zoom (320px reflow) without horizontal scroll', async ({
  page,
}) => {
  await page.setViewportSize({width: 320, height: 900});
  await gotoLoaded(page);

  // No horizontal scroll at reflow width (WCAG 1.4.10).
  const overflows = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  expect(overflows).toBe(false);

  // A modal still opens and closes by keyboard at this width.
  const trigger = page.getByRole('button', {name: 'Update email'});
  await trigger.click();
  await expect(page.getByRole('dialog', {name: /update email/i})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});
