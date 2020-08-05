import {launchAsync} from '@microsoft/immersive-reader-sdk';

function getTokenAndSubdomainAsync() {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: '/api/immersion_reader_token',
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

export default function handleLaunchImmersiveReader() {
  getTokenAndSubdomainAsync()
    .then(function(response) {
      console.log('DAYNE');
      console.log(response);
      const token = response.token;
      const subdomain = response.subdomain;
      const content = {
        title: 'Daynes content title',
        chunks: [
          {
            content: 'Hello Dayne. How are you doing?',
            lang: 'en'
          }
        ]
      };
      launchAsync(token, subdomain, content, {});
    })
    .catch(function(error) {
      console.log('DAYNE ERROR');
      console.log(error);
    });
}
