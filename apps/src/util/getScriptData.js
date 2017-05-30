/**
 * Helper function to pull json data off of script tags.
 *
 * @param name string - The name of the data attribute to look up.
 *     Note that this must be unique on the page.
 * @returns the decoded json value of the data attribute.
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
    console.error("Failed to parse script data for script", name);
    throw e;
  }
}

/**
 * Helper function to pull all json data off of the current script.
 *
 * Note that this function takes advantage of document.currentScript to retrieve
 * the script element, and therefore will not work if called within a callback
 * or event handler; it will only reference the element while it's initially
 * being processed.
 *
 * Example: given you have the following html:
 *
 *   <script src="myscript.js" data-some-server-object='{"userId": "foobar"}' data-some-server-string='"hello"'></script>
 *
 * Then calling getCurrentScriptData() from myscript.js would return the object:
 *
 *  {
 *    someServerObject: {
 *      userId: "foobar"
 *    },
 *    someServerString: "hello"
 *  }
 *
 * @returns an object containing the decoded json values of each of the data attributes
 */
export function getCurrentScriptData() {
  if (!document.currentScript && document.currentScript.dataset) {
    console.error("Cannot reference document.currentScript from a callback or event handler");
    return;
  }

  return Object.keys(document.currentScript.dataset).reduce((acc, val) => {
    try {
      acc[val] = JSON.parse(document.currentScript.dataset[val]);
    } catch (e) {
      console.error("Failed to parse script data for data attribute", val);
      throw e;
    }

    return acc;
  }, {});
}
