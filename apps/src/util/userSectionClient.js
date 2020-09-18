/* globals $ */

/**
 * Send a request to dashboard and retrieve a JSON array listing the
 * sections this user belongs to.
 * @param {function} callback Will be called on success
 */
export const getUserSections = function(callback) {
  var memberSectionsRequest = $.ajax({
    dataType: 'json',
    url: '/api/v1/sections/membership'
  });

  var ownedSectionsRequest = $.ajax({
    dataType: 'json',
    url: '/api/v1/sections'
  });

  $.when(memberSectionsRequest, ownedSectionsRequest).done(
    (result1, result2) => {
      var memberSectionData = result1[0];
      var ownedSectionData = result2[0];
      callback(memberSectionData.concat(ownedSectionData));
    }
  );
};

/**
 * Send a request to dashboard and retrieve a JSON object with
 * the specified section's details.
 * @param {number} sectionId The section to be queried
 * @param {function} callback Will be called on success
 */
export const getCurrentSection = function(sectionId, callback) {
  $.ajax({
    dataType: 'json',
    url: `/api/v1/sections/${sectionId}`
  }).done(result => {
    callback(result);
  });
};
