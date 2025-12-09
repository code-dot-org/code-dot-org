/**
 * API utilities for teaching profile data
 */

const API_ENDPOINT = '/teaching_profile_data';

/**
 * Save personalization data to the teaching profile
 * @param {Object} personalizationData - The personalization data to save
 * @returns {Promise} - Promise that resolves when data is saved
 */
export const saveTeachingProfileData = async personalizationData => {
  try {
    // Only serialize dates if they exist and are Date objects
    const dataToSave = {...personalizationData};
    if (dataToSave.dateYearsTeachingSet instanceof Date) {
      dataToSave.dateYearsTeachingSet =
        dataToSave.dateYearsTeachingSet.toISOString();
    }

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

    // Try PATCH first, fallback to POST if record doesn't exist
    let response = await fetch(API_ENDPOINT, {
      method: 'PATCH',
      headers: headers,
      body: requestBody,
    });

    // If PATCH fails because record doesn't exist, try POST
    if (!response.ok && response.status === 404) {
      response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: requestBody,
      });
    }

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
