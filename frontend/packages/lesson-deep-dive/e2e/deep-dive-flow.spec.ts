import {expect, test} from '@playwright/test';

// End-to-end smoke of the full mock-mode student flow: welcome -> personalized
// welcome -> the three lesson-stat boxes -> reflection -> pre-review -> practice
// modality chooser -> podcast. Everything runs against the package's dev host
// with MSW mocks, so no dashboard/apps build is involved.
test('student walks the deep-dive flow from welcome to a ready podcast', async ({
  page,
}) => {
  await page.goto('/');

  // Welcome -> personalized welcome.
  await page.getByRole('button', {name: "Let's go"}).click();
  await expect(
    page.getByRole('heading', {name: /Nice work today/i}),
  ).toBeVisible();

  // Advance through the personalized-welcome box and the three stat boxes
  // (levels attempted, time spent, validated levels) to reach reflection. The
  // Continue button is a FizzyButton whose accessible name is "Next".
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', {name: 'Next'}).click();
  }

  // Reflection: rate the three objectives (got it / struggling / got it), then
  // submit to move on. Struggling on the second objective makes it the focus
  // topic surfaced by the pre-review box below.
  await page.getByRole('button', {name: 'Got it'}).first().click();
  await page.getByRole('button', {name: 'Struggling'}).nth(1).click();
  await page.getByRole('button', {name: 'Got it'}).nth(2).click();
  await page.getByRole('button', {name: 'Start practicing'}).click();

  // Pre-review confirms the focus topic, then leads into the modality chooser.
  await expect(page.getByText(/we'll start with/i)).toBeVisible();
  await page.getByRole('button', {name: 'Choose how to practice'}).click();

  // Modality chooser -> podcast. The Play button is disabled until the mocked
  // audio fires canplay, so wait for it to become enabled.
  await expect(
    page.getByRole('heading', {name: 'How do you want to practice?'}),
  ).toBeVisible();
  await page.getByRole('button', {name: 'Listen to a podcast'}).click();
  await expect(page.getByRole('button', {name: 'Play'})).toBeEnabled({
    timeout: 10_000,
  });
});
