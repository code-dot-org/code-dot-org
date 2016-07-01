import $ from 'jquery';
var selectize;
var selected_state;

$(function () {
  var doneLoading = false;

  var districtElement = $('#school-district-id');

  function setupDistrictDropdown(stateCode) {
    doneLoading = false;

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
        },
        success: function (res) {
          var districts = [];

          for (var i = 0; i < res.object.length; i++) {
            var entry = res.object[i];
            districts.push({value: entry.id, text: entry.name});
          }
          callback(districts);
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
    if ($(this).prop("checked")) {
      // Disable districts.
      enableDistricts(false);

      // And clear district.
      clearDistrict();
    } else {
      // Enable districts.  (And clear "unknown district".)
      enableDistricts(true);
    }
  });

});
