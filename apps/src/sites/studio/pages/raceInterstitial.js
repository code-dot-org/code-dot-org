import $ from 'jquery';
import experiments from '@cdo/apps/experiments';

$(document).ready(function () {
    $("#edit_user").on('change', function (event) {
        var shouldEnableSubmit = false;
        $('.race-checkbox').each(function (i) {
            if (this.checked) {
                shouldEnableSubmit = true;
            }
        });
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
