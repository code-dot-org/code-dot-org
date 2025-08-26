/*
 * Fetch a custom prompt from our 'experimentation-settings' repo:
 *   https://github.com/code-dot-org/experimentation-settings/tree/main/tools/aitutor.
 *
 * Returns either the custom prompt or null if the custom prompt fails to load or times out.
 * Optionally pass a timeout in milliseconds (defaults to 10s) to revert to the default prompt.
 *
 * Example:
 *
 *    fetchCustomPrompt(customPromptName).then(prompt => {
 *      if (prompt) {
 *        console.log('got custom prompt:',prompt);
 *      } else {
 *        console.log('failed to get custom prompt!');
 *      }
 *    });
 **/

export const fetchCustomPrompt = async (
  promptName: string,
  timeoutMs = 10000
) => {
  const url = `https://raw.githubusercontent.com/code-dot-org/experimentation-settings/refs/heads/main/tools/aitutor/${promptName}.md`;
  const controller = new AbortController();

  //Timeout and use default system prompt.
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {signal: controller.signal});

    if (!response.ok) {
      throw new Error(`Fetch error: ${response.status}`);
    }

    const text = await response.text();
    return text;
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
