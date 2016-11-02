import $ from 'jquery';

window.DistrictDropdownManager = function (existingOptions) {

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

  function clearZip() {
    var zipElement = $('#school-zipcode');
    zipElement.val("");
  }

  function clearState() {
    var stateElement = $("#school-state");
    stateElement.val("");
  }

  function clearDistrict() {
    $("#school-district-id-form").val("");
  }

  $('#school-type').change(function () {
    if (['public', 'other'].indexOf($(this).val()) > -1) {
      // Show state.
      $('#school-state').closest('.form-group').show();
      $('#school-zipcode').closest('.form-group').hide();
      // And clear ZIP.
      clearZip();

    } else {
      // Show ZIP.
      $('#school-state').closest('.form-group').hide();
      $('#school-zipcode').closest('.form-group').show();
      $('#school-district').closest('.form-group').hide();
      // And clear state and district.
      clearState();
      clearDistrict();
    }
  });

  $('#school-state').change(function () {
    if ($(this).val() !== 'other') {
      // Show districts.  (State is already showing, so ZIP is already clear.)
      $('#school-district').closest('.form-group').show();
      setupDistrictDropdown($('#school-state').val());
    } else {
      $('#school-district').closest('.form-group').hide();
      // Clear district.
      clearDistrict();
    }
  });

  $('#school-district-other').change(function () {
    if ($(this).prop('checked')) {
      // Disable districts.
      enableDistricts(false);

      // And clear district.
      clearDistrict();
    } else {
      // Enable districts.  (And clear "unknown district".)
      enableDistricts(true);
    }
  });

  // Now that all the handlers are set up, initialize the control with existing
  // values if they were provided.

  if (existingOptions) {
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
  }
};
