# A class for determining and setting "feature modes" for the Gatekeeper and DCDO settings
# for a given set of scripts (e.g. the hour of code scripts.)
#
# There are currently three modes defined, intended to be easy to understand and reason about.
#
# normal:
#     All features enabled.
# scale:
#     Progress saved only on sharable levels for HOC tutorials.
#     Puzzle rating and hints disabled on all tutorials.
#     Sampled HOC activity logging at 10%.
# emergency:
#     Scale features, plus sharing disabled for all HOC tutorials.

require 'cdo/hip_chat'

class FeatureModeManager

  # A map from mode symbol to gatekeeper and dcdo settings. The gatekeeper settings are
  # broken down into gatekeeper_general_settings (which apply to all tutorials) and
  # gatekeeper_hoc_tutorial_settings (which apply to high-scale HOC tutorials only).
  MODE_SETTINGS_MAP = {
    normal: {
        gatekeeper_general_settings: {
            puzzle_rating: true,
            hint_view_request: true
        },
        gatekeeper_hoc_tutorial_settings: {
          postMilestone: true,
          shareEnabled: true,
        },
        dcdo_settings: {
          hoc_activity_sample_weight: 1,
          public_proxy_max_age: 3.minutes.to_i,
          public_max_age: 6.minutes.to_i,
        }
    },
    scale: {
      gatekeeper_general_settings: {
          puzzle_rating: false,
          hint_view_request: false
      },
      gatekeeper_hoc_tutorial_settings: {
        postMilestone: false,
        shareEnabled: true,
      },
      dcdo_settings: {
        hoc_activity_sample_weight: 10,
        public_proxy_max_age: 4.hours.to_i,
        public_max_age: 8.hours.to_i,
      }
    },
    emergency: {
      gatekeeper_general_settings: {
          puzzle_rating: false,
          hint_view_request: false
      },
      gatekeeper_hoc_tutorial_settings: {
        postMilestone: false,
        shareEnabled: false,
      },
      dcdo_settings: {
        hoc_activity_sample_weight: 10,
        public_proxy_max_age: 24.hours.to_i,
        public_max_age: 48.hours.to_i,
      }
    }
  }.with_indifferent_access

  MODES = MODE_SETTINGS_MAP.keys

  # Updates the settings for the specified scripts to the given mode.
  def self.set_mode(mode, gatekeeper, dcdo, script_names)
    settings = MODE_SETTINGS_MAP[mode]
    raise "Invalid mode '#{mode}'" if settings.nil?

    settings[:dcdo_settings].each do |key, value|
      dcdo.set(key, value)
    end

    settings[:gatekeeper_general_settings].each do |feature, value|
      gatekeeper.set(feature,  value: value)
    end

    settings[:gatekeeper_hoc_tutorial_settings].each do |feature, value|
      script_names.each do |script_name|
        gatekeeper.set(feature,  where: {script_name: script_name}, value: value)
      end
    end

    HipChat.log "Set scale feature mode for environment #{Rails.env} to #{mode}"
  end

  # Returns the matching mode if the dcdo and gatekeeper settings match
  # a predefined mode for all of the specified script names, or nil otherwise.
  def self.get_mode(gatekeeper, dcdo, script_names)
    MODES.detect do |mode|
      dcdo_matches_mode?(dcdo, mode) &&
        gatekeeper_general_settings_match_mode?(gatekeeper, mode) &&
        gatekeeper_hoc_tutorials_match_mode?(gatekeeper, mode, script_names)
    end
  end

  def self.dcdo_matches_mode?(dcdo, mode)
    expected_settings = MODE_SETTINGS_MAP[mode][:dcdo_settings]
    expected_settings.all? do |key, expected_value|
      expected_value == dcdo.get(key, nil)
    end
  end

  def self.gatekeeper_general_settings_match_mode?(gatekeeper, mode)
    expected_settings = MODE_SETTINGS_MAP[mode][:gatekeeper_general_settings]
    expected_settings.all? do |feature, expected_value|
      expected_value == gatekeeper.allows(feature)
    end
  end

  def self.gatekeeper_hoc_tutorials_match_mode?(gatekeeper, mode, script_names)
    expected_settings = MODE_SETTINGS_MAP[mode][:gatekeeper_hoc_tutorial_settings]
    expected_settings.all? do |feature, expected_value|
      script_names.all? do |script|
        expected_value == gatekeeper.allows(feature, where: {script_name: script})
      end
    end
  end

end
