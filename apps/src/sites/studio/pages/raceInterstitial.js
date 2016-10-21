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
            others.attr('checked', false);
            others.attr('disabled', true);
            others.parent().addClass('disabled'); // gray out labels
        } else {
            // Re-enable
            raceCheckboxes.attr('disabled', false);
            raceCheckboxes.parent().removeClass('disabled');
        }

        if (shouldEnableSubmit) {
            $("#race-submit").prop('disabled', false).removeClass("disabled-button");
        } else {
            $("#race-submit").prop('disabled', true).addClass("disabled-button");
        }
    });

    $("#edit_user").submit(function (event) {
        event.preventDefault();
        $.ajax({
            type: 'POST',
            url: $(this).attr('action'),
            data: $(this).serialize(),
            dataType: 'json',
            success: function (data) {$("#race-modal").modal('hide');}
        });
    });

    $('#later-link').click(function () {
        $("#race-modal").modal('hide');
    });
});

$(document).ready(function () {
    if (experiments.isEnabled('raceInterstitial')) {
        $("#race-modal").modal('show');
    }
});
