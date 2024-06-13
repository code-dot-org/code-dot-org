import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://clever.com/oauth/sis/login?target=NTQyOTlmNmVjYzU0NGRhODdjMDAwMDcw%3BNGM2M2MxY2Y2MjNkY2U4MmNhYWM%3D%3BaHR0cHM6Ly9jbGV2ZXIuY29tL2luL2F1dGhfY2FsbGJhY2s%3D%3BN2U0NjZjZmExYWJjYzFmZGIzMjViNzUyZTg1OWEyZmYwNTYyZjg1NDg0NTlkMjkyM2QwZjJlMDU4MmUzMTRmYg%3D%3D%3BY29kZQ%3D%3D%3B&skip=1&default_badge=');
  await page.getByLabel('Username').click();
  await page.getByLabel('Username').click();
  await page.getByLabel('Username').fill('maria.jones');
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('q&7(CsQi(M');
  await page.getByLabel('Log in', { exact: true }).click();
  await page.goto('https://staging-studio.code.org/users/sign_in');
  await page.getByRole('button', { name: 'Continue with Clever' }).click();
  await page.getByRole('button', { name: 'Maria' }).click();
  await page.getByRole('link', { name: 'Account settings' }).click();
  const disconnectCell = page.getByRole('button', {name : 'Disconnect'});
  await expect(disconnectCell).toBeVisible();
  await expect(page).toHaveScreenshot();
});