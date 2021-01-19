import $ from 'jquery';
import cookies from 'js-cookie';
import firehoseClient from '@cdo/apps/lib/util/firehose';

$(document).ready(function() {
  var already_shown = !!cookies.get('has_seen_thank_donors');
  if (!already_shown && window.innerWidth > 800 && window.innerHeight > 600) {
    $('#thank-donors-modal').modal('show');
    cookies.set('has_seen_thank_donors', '1');

    firehoseClient.putRecord(
      {
        study: 'thank-donors-interstitial',
        event: 'saw-thank-donors-interstitial'
      },
      {includeUserId: true}
    );
  }

  $('#dismiss-thank-donors').click(function() {
    $('#thank-donors-modal').modal('hide');
  });
});
