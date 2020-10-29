/**
 * Helper function to pull json data off of script tags.
 *
 * @param {string} name - The name of the data attribute to look up.
 *     Note that this must be unique on the page.
 * @returns {Object} the decoded json value of the data attribute.
 *
 * Example: given you have the following html:
 *
 *   <script src="myscript.js" data-someServerData='{"userId": "foobar"}'></script>
 *
 * you could use this function like so:
 *
 *   const userId = getScriptData('someServerData').userId;
 *   console.log("the server that rendered this page claims the user is", userid);
 *
 */
export default function getScriptData(name) {
  name = name.toLowerCase();
  const script = document.querySelector(`script[data-${name}]`);
  try {
    return JSON.parse(script.dataset[name]);
  } catch (e) {
    console.error('Failed to parse script data for script', name);
    throw e;
  }
}

export function hasScriptData(name) {
  return !!document.querySelector(name);
}
