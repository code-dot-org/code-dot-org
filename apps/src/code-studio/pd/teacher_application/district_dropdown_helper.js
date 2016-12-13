import _ from 'lodash';

export function getDistrictDropdownValues() {
  const districtValues = {
    ['us-or-international']: document.getElementById('us-or-international').value,
    ['school-type']: document.getElementById('school-type').value,
    ['school-state']: document.getElementById('school-state').value,
    ['school-district']: document.querySelector('#school-district input').value,
    ['school']: document.querySelector('#school input').value
  };

  if (document.getElementById('school-district-other').checked) {
    _.assign(districtValues, {
      ['school-district-name']: document.getElementById('school-district-name').value
    });
  }

  if (document.getElementById('school-district-other').checked ||
    document.getElementById('school-other').checked) {
    _.assign(districtValues, {
      ['school-name']: document.getElementById('school-name').value,
      ['school-zipcode']: document.getElementById('school-zipcode').value
    });
  }

  return districtValues;
}

export function validateDistrictData(formData) {
  //These three must always be filled out
  const baseDistrictDataCompleted = !!(formData['us-or-international'] && formData['school-type'] && formData['school-state']);

  if (!baseDistrictDataCompleted) {
    return false;
  }

  if (document.getElementById('school-district-other').checked) {
    //If you clicked "other district" then expect these three to be filled out
    return !!(formData['school-district-name'] && formData['school-name'] && formData['school-zipcode']);
  } else if (document.getElementById('school-other').checked) {
    //If you clicked "other school in this district" then expect these three to be filled out
    return !!(formData['school-district'] && formData['school-name'] && formData['school-zipcode']);
  } else {
    //If you clicked neither, then expect these two to be filled out
    return !!(formData['school-district'] && formData['school']);
  }
}
