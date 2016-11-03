import $ from 'jquery';

window.SchoolInfoManager = function (existingOptions) {

  var districtListFirstLoad = true;

  var districtElement = $('#school-district-id');

  function setupDistrictDropdown(stateCode) {
    var selectize = districtElement[0].selectize;
    if (selectize) {
      selectize.clear();
      selectize.destroy();
    }

    selectize = districtElement.selectize({
      maxItems: 1,
      onChange: function () {
        var districtId = districtElement[0].selectize.getValue();
        $("#school-district-id-form").val(districtId);
      }
    });

    districtElement[0].selectize.load(function (callback) {
      $.ajax({
        url: "/dashboardapi/v1/school-districts/" + stateCode,
        type: 'GET',
        error: function () {
          callback();
          districtListFirstLoad = false;
        },
        success: function (res) {
          var districts = [];

          for (var i = 0; i < res.object.length; i++) {
            var entry = res.object[i];
            districts.push({value: entry.id, text: entry.name});
          }
          callback(districts);

          // Only do this first time we do a load of this dropdown content.
          // The assumption is that if we had a valid school_district_id then
          // we would hit this codepath immediately after page load.
          if (districtListFirstLoad && existingOptions && existingOptions.school_district_id) {
            $('#school-district-id')[0].selectize.setValue(existingOptions.school_district_id);
          }
          districtListFirstLoad = false;
        }
      });
    });

  }

  function enableDistricts(enable) {
    var selectize = districtElement[0].selectize;
    if (selectize) {
      if (enable) {
        selectize.enable();
      } else {
        selectize.disable();
        selectize.clear();
      }
    }
  }

  function clearDistrict() {
    $("#school-district-id-form").val("");
    $("#school-district-other").val(false);
    $("#school-district-name").val("");
  }

  function clearAndHideDistrict() {
    clearDistrict();
    $('#school-district').closest('.form-group').hide();
    $('#school-district-name').closest('.form-group').hide();
  }

  function isPrivateOrOther() {
    return ['private', 'other'].indexOf($('#school-type').val()) > -1;
  }

  function isPublicOrCharter() {
    return ['public', 'charter'].indexOf($('#school-type').val()) > -1;
  }

  function isUs() {
    return $('#school-country').val() === 'US';
  }

  function show(selector) {
    $(selector).closest('.form-group').show();
  }

  function clearAndHide(selector) {
    $(selector).val('');
    $(selector).closest('.form-group').hide();
  }

  $('#school-country').change(function () {
    if ($(this).val() === 'US') {
      clearAndHide('#school-name');
      clearAndHide('#school-address');
      // Show fields corresponding to the current contents of the type dropdown.
      $('#school-type').change();
    } else { // non-US
      clearAndHide('#school-zipcode');
      clearAndHide('#school-state');
      clearAndHideDistrict();
      show('#school-name');
      show('#school-address');
    }
  });

  $('#school-type').change(function () {
    if (isUs() && isPublicOrCharter()) {
      show('#school-state');
      clearAndHide('#school-zipcode');
      clearAndHide('#school-name');
    } else if (isUs() && isPrivateOrOther()) {
      clearAndHide('#school-state');
      show('#school-zipcode');
      clearAndHideDistrict();
      show('#school-name');
    } else {
      // no type or non-US
    }
  });

  $('#school-state').change(function () {
    if ($(this).val() !== 'other') {
      show('#school-district');
      setupDistrictDropdown($('#school-state').val());
    } else {
      clearAndHideDistrict();
    }
  });

  $('#school-district-other').change(function () {
    if ($(this).prop('checked')) {
      // Disable districts.
      enableDistricts(false);

      // And clear district id.
      $("#school-district-id-form").val('');

      show('#school-district-name');
    } else {
      // Enable districts.
      enableDistricts(true);
      clearAndHide('#school-district-name');
    }
  });

  // Now that all the handlers are set up, initialize the control with existing
  // values if they were provided.

  if (existingOptions) {
    if (existingOptions.country) {
      $('#school-country').val(existingOptions.country).change();
    }

    if (existingOptions.school_type) {
      $('#school-type').val(existingOptions.school_type).change();
    }

    if (existingOptions.zip) {
      $('#school-zipcode').val(existingOptions.zip).change();
    }

    if (existingOptions.state) {
      $('#school-state').val(existingOptions.state).change();
    }

    if (existingOptions.school_district_other) {
      $('#school-district-other').prop('checked', true).change();
    }

    if (existingOptions.school_district_name) {
      $('#school-district-name').val(existingOptions.school_district_name).change();
    }

    if (existingOptions.school_name) {
      $('#school-name').val(existingOptions.school_name).change();
    }

    if (existingOptions.full_address) {
      $('#school-address').val(existingOptions.full_address).change();
    }
  }
};
