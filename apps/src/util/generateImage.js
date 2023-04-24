/* globals appOptions */

export const generateOpenAIImage = prompt => {
  return $.ajax({
    url: '/openai/image_generate',
    method: 'POST',
    data: {prompt},
    headers: {
      'X-CSRF-Token': appOptions.authenticityToken
    }
  });
};

export const uploadGeneratedImageUrl = (channelId, fileName, sourceUrl) => {
  // Convert the base64 image data to a Blob
  return fetch(sourceUrl)
    .then(response => response.blob())
    .then(blob => {
      // Create a File object
      const file = new File([blob], fileName, {type: 'image/png'});

      // Create a FormData object to hold the file data
      const formData = new FormData();
      formData.append('files[]', file);

      // Return the AJAX request
      return $.ajax({
        url: `/v3/animations/${channelId}/${fileName}`,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
          console.log('Upload successful:', data);
        },
        error: function (xhr, status, error) {
          console.error('Upload failed:', status, error);
        },
        headers: {
          'X-CSRF-Token': appOptions.authenticityToken
        }
      });
    });
};

export const uploadGeneratedBase64Image = (
  channelId,
  fileName,
  base64ImageData
) => {
  // Convert the base64 image data to a Blob
  return fetch(`data:image/png;base64,${base64ImageData}`)
    .then(response => response.blob())
    .then(blob => {
      // Create a File object
      const file = new File([blob], fileName, {type: 'image/png'});

      // Create a FormData object to hold the file data
      const formData = new FormData();
      formData.append('files[]', file);

      // Return the AJAX request
      return $.ajax({
        url: `/v3/animations/${channelId}/${fileName}`,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
          console.log('Upload successful:', data);
        },
        error: function (xhr, status, error) {
          console.error('Upload failed:', status, error);
        },
        headers: {
          'X-CSRF-Token': appOptions.authenticityToken
        }
      });
    });
};
