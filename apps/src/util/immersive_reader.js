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
    })
    .catch(function(error) {
      console.log('DAYNE ERROR');
      console.log(error);
    });
}
