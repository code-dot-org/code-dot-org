import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

export async function getCodeDiffSummary(
  oldCode: string,
  newCode: string
): Promise<string | undefined> {
  try {
    const response = await fetch('/code_diffs/get_code_difference_summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify({
        oldCode: oldCode,
        newCode: newCode,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to summarize code differences: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching code difference summary:', error);
  }
}
