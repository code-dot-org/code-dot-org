import {expect, test, type Locator, type Page} from '@playwright/test';

async function gotoLoaded(page: Page, scenario = 'teacher') {
  await page.goto(`/?scenario=${scenario}`);
  await page.getByRole('heading', {level: 1, name: 'My Account'}).waitFor();
}

// Focus must sit on a control INSIDE the dialog, never on MUI's container
// ancestor, which announces nothing. A locator scoped to the dialog matches
// descendants only, so focus on the container itself counts as zero — that is
// the discrimination worth keeping. Retries built in, because focus moves in the
// dialog's onEntered, after the open transition.
const expectFocusInside = (dialog: Locator) =>
  expect(dialog.locator(':focus')).toHaveCount(1);

test('the live tab is keyboard-focusable; placeholder tabs are disabled', async ({
  page,
}) => {
  await gotoLoaded(page);

  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(4);

  await tabs.first().focus();
  await expect(tabs.first()).toBeFocused();

  await expect(tabs.nth(1)).toBeDisabled();
  await expect(tabs.last()).toBeDisabled();
});

test('Save button submits on Enter when focused', async ({page}) => {
  await gotoLoaded(page);
  await page.getByLabel(/Display name/).fill('Grace');

  const save = page.getByRole('button', {name: 'Save changes'});
  await save.focus();
  await expect(save).toBeFocused();
  await save.press('Enter');
  // Success now confirms via the toast (a polite live region) and the save bar
  // clears, rather than a lingering "saved" message in the bar.
  await expect(page.getByRole('status')).toHaveText('Changes saved.');
  await expect(save).toBeHidden();
});

test('update-email modal traps focus, closes on Escape, and returns focus', async ({
  page,
}) => {
  await gotoLoaded(page);

  const trigger = page.getByRole('button', {name: 'Update email'});
  await trigger.click();

  const dialog = page.getByRole('dialog', {name: /update email/i});
  await expect(dialog).toBeVisible();

  await expectFocusInside(dialog);
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  // Still inside after tabbing: the trap held.
  await expectFocusInside(dialog);

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
  const dialog = page.getByRole('dialog', {name: /update password/i});
  await expect(dialog).toBeVisible();

  await expectFocusInside(dialog);

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('delete-account alertdialog opens and closes on Escape with focus returned', async ({
  page,
}) => {
  await gotoLoaded(page);

  const trigger = page.getByRole('button', {name: /delete my account/i});
  await trigger.click();
  const dialog = page.getByRole('alertdialog', {name: /delete/i});
  await expect(dialog).toBeVisible();

  await expectFocusInside(dialog);

  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('sign-out alertdialog moves initial focus inside and returns it on Escape', async ({
  page,
}) => {
  await gotoLoaded(page);

  const trigger = page.getByRole('button', {
    name: /sign out all other sessions/i,
  });
  await trigger.click();
  const dialog = page.getByRole('alertdialog', {
    name: /sign out all other sessions/i,
  });
  await expect(dialog).toBeVisible();

  await expectFocusInside(dialog);

  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('critical flows work at 400% zoom (320px reflow) without horizontal scroll', async ({
  page,
}) => {
  await page.setViewportSize({width: 320, height: 900});
  await gotoLoaded(page);

  // Poll: a late webfont swap can widen content for a frame after the H1 paints.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(1);

  const trigger = page.getByRole('button', {name: 'Update email'});
  await trigger.click();
  await expect(page.getByRole('dialog', {name: /update email/i})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

// DSCO Checkbox hides its real input as position:absolute/opacity:0 stretched
// across the label's first line, so a link sitting there is covered and cannot be
// clicked. Only real layout exposes this — jsdom has no hit-testing — so the
// assertion is that the link is what the pointer actually reaches.
test('links inside the delete acknowledgments are clickable, not covered by the checkbox', async ({
  page,
}) => {
  await gotoLoaded(page);
  await page.getByRole('button', {name: /delete my account/i}).click();
  const dialog = page.getByRole('alertdialog', {name: /delete/i});
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', {name: 'Next'}).click();

  for (const name of ['message to send to parents', 'Learn more']) {
    const link = dialog.getByRole('link', {name});
    await expect(link).toBeVisible();
    const reachesLink = await link.evaluate(a => {
      // First client rect, not the bounding box: these links sit in prose and
      // wrap, and the union box's centre can land between the line boxes.
      const r = a.getClientRects()[0];
      const hit = document.elementFromPoint(
        r.x + r.width / 2,
        r.y + r.height / 2,
      );
      return !!hit && (hit === a || a.contains(hit));
    });
    expect(reachesLink, `pointer should reach "${name}"`).toBe(true);
  }

  // Reaching the links must not have cost the label its own click target.
  const acknowledgment = dialog
    .locator('label')
    .filter({hasText: 'message to send to parents'});
  await acknowledgment.getByText('to warn them', {exact: false}).click();
  await expect(acknowledgment.getByRole('checkbox')).toBeChecked();
});
