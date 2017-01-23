// This file used to be an erb file that generated a big javascript file
// that concatenated a bunch of other javascript files provided by ruby gems.
// Since we no longer want to use any part of the rails asset pipeline, and
// instead use webpack exclusively, we had to copy all the files from the ruby
// gems and put them in here.

// TODO: figure out which of these are actually still using and which
// we can get rid of.
// TODO: upgrade these libraries to their latest npm published versions
// TODO: stop using script-loader in favor of actual references where they get
// used
require('script-loader!@cdo/apps/third-party/jquery-1.12.1.js');
require('script-loader!@cdo/apps/third-party/jquery_ujs.js');
require('script-loader!@cdo/apps/third-party/jquery.ui-1.11.4.js');

require('script-loader!@cdo/apps/third-party/bootstrap-2.3.2.js');
require('script-loader!@cdo/apps/third-party/jquery.mask-1.7.7.js');
require('script-loader!@cdo/apps/third-party/jquery.placeholder.js');
require('script-loader!@cdo/apps/third-party/jquery.qtip-2.2.0.js');
require('script-loader!@cdo/apps/third-party/jquery.query-object-2.1.7.js');
require('script-loader!@cdo/apps/third-party/jquery.timeago-1.4.1.js');
require('@cdo/apps/third-party/selectize.js');

require('script-loader!@cdo/dashboard/vendor/assets/javascripts/add2home.js');
require('script-loader!@cdo/dashboard/vendor/assets/javascripts/jquery.simulate.js');
require('script-loader!@cdo/dashboard/vendor/assets/javascripts/jquery.ui.touch-punch.js');
require('script-loader!@cdo/dashboard/vendor/assets/javascripts/jquery.overlaps.js');
require('script-loader!@cdo/dashboard/vendor/assets/javascripts/md5.js');
require('script-loader!@cdo/shared/js/details-polyfill/jquery.details.js');
require('script-loader!@cdo/shared/js/details-polyfill/details-polyfill.js');
