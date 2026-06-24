import {expect, type Page} from '@playwright/test';

/**
 * Poll the script[data-<dataset>] element's JSON data until the named key
 * equals the expected string value. Mirrors script_data_steps.rb:
 *   "it is eventually observed that the {dataset} script data field {key} is {value}"
 *
 * The update fires in a jQuery .then() callback after a network response, so
 * the poll uses expect.poll to retry asynchronously.
 */
export async function pollScriptDataField(
  page: Page,
  dataset: string,
  key: string,
  expectedValue: string,
): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(
          ({dataset, key}) => {
            const el = document.querySelector(`script[data-${dataset}]`);
            if (!el) return null;
            try {
              const parsed: unknown = JSON.parse(
                (el as HTMLElement).dataset[dataset] ?? '{}',
              );
              if (
                parsed &&
                typeof parsed === 'object' &&
                !Array.isArray(parsed)
              ) {
                return String((parsed as Record<string, unknown>)[key] ?? '');
              }
            } catch {
              // unparseable — treat as absent
            }
            return null;
          },
          {dataset, key},
        ),
      {timeout: 10_000},
    )
    .toBe(expectedValue);
}
