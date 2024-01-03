# A dynamic configuration module that allows us to update
# config settings without pushing new code.

require 'dynamic_config/datastore_cache'
require 'dynamic_config/dynamic_config_base'
require 'dynamic_config/environment_aware_dynamic_config_helper'
require 'dynamic_config/adapters/dynamodb_adapter'
require 'dynamic_config/adapters/json_file_adapter'
require 'dynamic_config/adapters/memory_adapter'

class DCDOBase < DynamicConfigBase
  # Factory method for creating DCDOBase objects
  # @returns [DCDOBase]
  def self.create
    datastore_cache = EnvironmentAwareDynamicConfigHelper.create_datastore_cache(CDO.dcdo_table_name)
    DCDOBase.new datastore_cache
  end

  # Generate the a mapping of DCDO configurations we want to forward to frontend code so it can have
  # access to the values. For example, boolean DCDO config could be used to turn a new feature on or
  # off.
  # Please note that for the frontend Javascript code, this data could be stale due to the caching
  # behavior of the page. Analyze the HTTP headers of the pages you are interested in to understand
  # what kind of caching they use and if that will be a concern.
  # @return [Hash] A mapping of DCDO keys to values which we want frontend code to have access to.
  def frontend_config
    # Add DCDO configurations you would like to be available on the frontend/javascript.
    # For example:
    # 'my-new-feature': DCDO.get('my-new-feature', false)
    {
      'frontend-i18n-tracking': DCDO.get('frontend-i18n-tracking', false),
      clearerSignUpUserType: DCDO.get('clearerSignUpUserType', false),
      'pl-teacher-application-off-season': DCDO.get('pl_teacher_application', false),
      'csa-homepage-banner-2022': DCDO.get('csa-homepage-banner-2022', false),
      'csa-skinny-banner': DCDO.get('csa-skinny-banner', false),
      'csta-form-extension': DCDO.get('csta-form-extension', false),
      'pl-launch-hero-banner': DCDO.get('pl-launch-hero-banner', false),
      'curriculum-launch-hero-banner': DCDO.get('curriculum-launch-hero-banner', false),
      'curriculum-launch-skinny-banner': DCDO.get('curriculum-launch-skinny-banner', false),
      'ai-pl-launch-banners': DCDO.get('ai-pl-launch-banners', false),
      cpa_experience: DCDO.get('cpa_experience', false),
      gender: DCDO.get('gender', false),
      'show-coteacher-ui': DCDO.get('show-coteacher-ui', true),
      'amplitude-event-sample-rates': DCDO.get('amplitude-event-sample-rates', {}),
      # Whether to allow the user to toggle between the new and old progress UI.
      'progress-ui-refresh-enabled': DCDO.get('progress-ui-refresh', false),
      # Whether to show the new progress UI or the old one by default.
      'progress-ui-refresh-default-new': DCDO.get('progress-ui-refresh-default-new', false),
    }
  end
end

DCDO = DCDOBase.create
