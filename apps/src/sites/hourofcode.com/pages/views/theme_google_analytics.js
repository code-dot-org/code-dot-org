import googleAnalyticsReporter from '@cdo/apps/lib/util/GoogleAnalyticsReporter';

const {userAnalyticsDimensions = {}} = window;

Object.entries(userAnalyticsDimensions).forEach(([dimension, value]) => {
  googleAnalyticsReporter.setCustomDimension(dimension, value);
});

googleAnalyticsReporter.setCustomDimension('anonymizeIp', true);

googleAnalyticsReporter.sendPageView();
