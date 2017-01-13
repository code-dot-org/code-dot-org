export function validateDistrictData(formData) {
  //These three must always be filled out
  const baseDistrictDataCompleted = !!(formData['us-or-international'] && formData['school-type'] && formData['school-state']);

  if (!baseDistrictDataCompleted) {
    return false;
  }

  if (['private', 'other'].includes(formData['school-type'].toLowerCase())) {
    //Private schools need to fill out name and zipcode
   return !!(formData['school-name'] && formData['school-zipcode']);
  } else if (formData['school-district-other']) {
    //If you clicked "other district" then expect these three to be filled out
    return !!(formData['school-district-name'] && formData['school-name'] && formData['school-zipcode']);
  } else if (formData['school-other']) {
    //If you clicked "other school in this district" then expect these three to be filled out
    return !!(formData['school-district'] && formData['school-name'] && formData['school-zipcode']);
  } else {
    //If you clicked neither, then expect these two to be filled out
    return !!(formData['school-district'] && formData['school']);
  }
}
