import {launchAsync} from '@microsoft/immersive-reader-sdk';

/**
 * Generates a temporary authentication token which can be used to call the Immersive Reader API.
 * @returns {Promise<unknown>} { token: <auth_token>, subdomain: <azure_subdomain> }
 */
function getTokenAndSubdomainAsync() {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: '/api/immersive_reader_token',
      type: 'GET',
      success: function(data) {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      }
    });
  });
}

/**
 * Click handler for the Immersive Reader Button which will take the given text and launch the Microsoft Immersive
 * Reader interface. This interface gives student's many tools to control how the text is presented them.
 * @param locale The locale of the text e.g. 'en-US', 'ar-SA', etc.
 * @param title The optional title to show above the given text in the Immersive Reader.
 * @param text The text the user the wants to read more easily.
 */
export default function handleLaunchImmersiveReader(locale, title, text) {
  getTokenAndSubdomainAsync()
    .then(function(response) {
      const token = response.token;
      const subdomain = response.subdomain;
      const data = {
        title: title,
        chunks: [
          {
            content: sanitizeText(text),
            lang: locale
          }
        ]
      };
      launchAsync(token, subdomain, data, {});
    })
    .catch(function(error) {
      console.error(error);
    });
}

function sanitizeText(text) {
  if (!text) {
    return text;
  }
  // Strip XML
  text = text.replace(/<[^>]*>/g, '');

  // Strip markdown characters
  text = text.replace(/[`*]/g, '');
  return text;
}
