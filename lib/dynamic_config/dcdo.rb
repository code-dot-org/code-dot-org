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
      'pl-teacher-application-off-season': DCDO.get('pl_teacher_application', false),
      'pl-launch-hero-banner': DCDO.get('pl-launch-hero-banner', false),
      'curriculum-launch-2024': DCDO.get('curriculum-launch-2024', false),
      'csta-form-extension': DCDO.get('csta-form-extension', false),
      cpa_experience: DCDO.get('cpa_experience', false),
      gender: DCDO.get('gender', false),
      'amplitude-event-sample-rates': DCDO.get('amplitude-event-sample-rates', {}),
      # Whether to allow the user to toggle between the v1 and v2 progress tables.
      'progress-table-v2-enabled': DCDO.get('progress-table-v2-enabled', false),
      # Whether to show the v1 or v2 progress table by default.
      'progress-table-v2-default-v2': DCDO.get('progress-table-v2-default-v2', false),
      # Whether to allow users with `progress_table_v2_closed_beta` user preference to toggle between v1 and v2.
      'progress-table-v2-closed-beta-enabled': DCDO.get('progress-table-v2-closed-beta-enabled', false),
      # Whether the scholarship dropdown is locked on the application dashboard.
      'scholarship-dropdown-locked': DCDO.get('scholarship-dropdown-locked', true),
      hoc_mode: DCDO.get('hoc_mode', false),
      # Whether to show the marketing banners for the AI Teacher Assistant launch. Can be removed later.
      'ai-teaching-assistant-launch': DCDO.get('ai-teaching-assistant-launch', false),
      'incubator-canvas-block-enabled': DCDO.get('incubator-canvas-block-enabled', true),
      'progress-table-v2-metadata-enabled': DCDO.get('progress-table-v2-metadata-enabled', false),
      'music-lab-samples-report': DCDO.get('music-lab-samples-report', true),
      'disable-try-new-progress-view-modal': DCDO.get('disable-try-new-progress-view-modal', false),
      'music-lab-existing-projects-default-sounds': DCDO.get('music-lab-existing-projects-default-sounds', true),
      'show-age-gated-students-banner': DCDO.get('show-age-gated-students-banner', true),
      'cfu-pin-hide-enabled': DCDO.get('cfu-pin-hide-enabled', false),
      'teacher-local-nav-v2': DCDO.get('teacher-local-nav-v2', false),
      'best-of-stem-2024': DCDO.get('best-of-stem-2024', false),
      section_create_lms_cards: DCDO.get('section_create_lms_cards', false),
    }
  end
end

DCDO = DCDOBase.create
