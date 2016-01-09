# A class for determining and setting "feature modes" for the Gatekeeper and DCDO settings
# for a given set of scripts (e.g. the hour of code scripts.)
#
# There are currently three modes defined, intended to be easy to understand and reason about.
#
# - normal: All features enabled for all of the given scripts.
# - scale: milestone posts disabled excepting for sharing levels, sharing enabled,
#     puzzle rating and hints disabled. Sampled hoc activity logging at 10%.
# - emergency: scale features, plus sharing disabled. Sampled hoc activity logging at 10%.
class FeatureModeManager

  # A map from mode symbol to gatekeeper_settings and dcdo_settings.
  MODE_SETTINGS_MAP = {
    normal: {
        gatekeeper_settings: {
          postMilestone: true,
          shareEnabled: true,
          puzzle_rating: true,
          hint_view_request: true
        },
        dcdo_settings: {
          hoc_activity_sample_weight: 1,
          public_proxy_max_age: 3.minutes.to_i,
          public_max_age: 6.minutes.to_i,
        }
    },
    scale: {
      gatekeeper_settings: {
        postMilestone: false,
        shareEnabled: true,
        puzzle_rating: false,
        hint_view_request: false
      },
      dcdo_settings: {
        hoc_activity_sample_weight: 10,
        public_proxy_max_age: 4.hours.to_i,
        public_max_age: 8.hours.to_i,
      }
    },
    emergency: {
      gatekeeper_settings: {
        postMilestone: false,
        shareEnabled: false,
        puzzle_rating: false,
        hint_view_request: false
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

    settings[:gatekeeper_settings].each do |feature, value|
      script_names.each do |script_name|
        gatekeeper.set(feature,  where: {script_name: script_name}, value: value)
      end
    end
  end

  # Returns the matching mode if the dcdo and gatekeeper settings match
  # a predefined mode for all of the specified script names, or nil otherwise.
  def self.get_mode(gatekeeper, dcdo, script_names)
    MODES.detect do |mode|
      dcdo_matches_mode?(dcdo, mode) &&
        gatekeeper_matches_mode?(gatekeeper, mode, script_names)
    end
  end

  def self.dcdo_matches_mode?(dcdo, mode)
    expected_settings = MODE_SETTINGS_MAP[mode][:dcdo_settings]
    expected_settings.all? do |key, expected_value|
      expected_value == dcdo.get(key, nil)
    end
  end

  def self.gatekeeper_matches_mode?(gatekeeper, mode, script_names)
    expected_settings = MODE_SETTINGS_MAP[mode][:gatekeeper_settings]
    expected_settings.all? do |feature, expected_value|
      script_names.all? do |script|
        expected_value == gatekeeper.allows(feature, where: {script_name: script})
      end
    end
  end

end
