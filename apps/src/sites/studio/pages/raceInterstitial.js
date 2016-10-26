import $ from 'jquery';
import experiments from '@cdo/apps/experiments';

$(document).ready(function () {
    $("#edit_user").on('change', function (event) {
        var shouldEnableSubmit = false;
        var optOutSelected = false;
        var raceCheckboxes = $('.race-checkbox');
        raceCheckboxes.each(function (i) {
            if (this.checked) {
                shouldEnableSubmit = true;
                if (this.id === 'user_races_opt_out') {
                    optOutSelected = true;
                }
            }
        });
        if (optOutSelected) {
            // Disable and clear all non-opt-out checkboxes and gray out labels
            var others = raceCheckboxes.not('#user_races_opt_out');
            others.prop('checked', false);
            others.prop('disabled', true);
            others.parent().addClass('disabled'); // gray out labels
        } else {
            // Re-enable
            raceCheckboxes.prop('disabled', false);
            raceCheckboxes.parent().removeClass('disabled');
        }

        if (shouldEnableSubmit) {
            $("#race-submit").prop('disabled', false).removeClass("disabled-button");
        } else {
            $("#race-submit").prop('disabled', true).addClass("disabled-button");
        }
    });

    function submitCheckboxData(form) {
        $.ajax({
            type: 'POST',
            url: form.attr('action'),
            data: form.serialize(),
            dataType: 'json',
            success: function (data) {
                $("#race-modal").modal('hide');
            }
        });
    }

    $("#edit_user").submit(function (event) {
        event.preventDefault();
        submitCheckboxData($(this));
    });

    $('#later-link').click(function () {
        var raceCheckboxes = $('.race-checkbox');
        raceCheckboxes.prop('checked', false);
        $('#user_races_closed_dialog').prop('checked', true);
        submitCheckboxData($("#edit_user"));
        $("#race-modal").modal('hide');
    });
});

$(document).ready(function () {
    if (experiments.isEnabled('raceInterstitial')) {
        $('#race-modal').modal('show');
        $('#closed-dialog-label').hide();
    }
});
