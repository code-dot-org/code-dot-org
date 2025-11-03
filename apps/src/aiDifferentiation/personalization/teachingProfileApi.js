/**
 * API utilities for teaching profile data
 */

const API_ENDPOINT = '/teaching_profile_data';

/**
 * Normalize personalization data before sending it to the server.
 * Ensures dates are serialized to ISO strings.
 * @param {Object} personalizationData
 * @returns {Object}
 */
export const serializeTeachingProfileData = personalizationData => {
  const dataToSave = {...(personalizationData || {})};
  const dateValue = dataToSave.dateYearsTeachingSet;

  if (dateValue instanceof Date) {
    dataToSave.dateYearsTeachingSet = dateValue.toISOString();
  } else if (typeof dateValue === 'string' && dateValue) {
    const parsedDate = new Date(dateValue);
    dataToSave.dateYearsTeachingSet = isNaN(parsedDate)
      ? null
      : parsedDate.toISOString();
  } else if (dateValue) {
    const parsedDate = new Date(dateValue);
    dataToSave.dateYearsTeachingSet = isNaN(parsedDate)
      ? null
      : parsedDate.toISOString();
  } else {
    dataToSave.dateYearsTeachingSet = null;
  }

  return dataToSave;
};

/**
 * Save personalization data to the teaching profile
 * @param {Object} personalizationData - The personalization data to save
 * @returns {Promise} - Promise that resolves when data is saved
 */
export const saveTeachingProfileData = async personalizationData => {
  try {
    // Create a clean copy of the data with proper serialization for dates
    const dataToSave = serializeTeachingProfileData(personalizationData);

    const requestBody = JSON.stringify({
      teaching_profile_data: {
        individual_data: dataToSave,
      },
    });

    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute('content');
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    };

    // First check if a record exists
    const checkResponse = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {'X-CSRF-Token': csrfToken},
    });

    if (!checkResponse.ok) {
      throw new Error('Failed to check existing teaching profile data');
    }

    const existingRecord = await checkResponse.json();
    const method = existingRecord.exists ? 'PATCH' : 'POST';

    // Create or update based on existence
    const response = await fetch(API_ENDPOINT, {
      method: method,
      headers: headers,
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.join(', ') || 'Failed to save teaching profile data'
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving teaching profile data:', error);
    throw error;
  }
};
