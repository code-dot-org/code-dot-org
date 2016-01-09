# A class for determining and setting "feature modes" for the Gatekeeper and DCDO settings
# for a given set of scripts (e.g. the hour of code scripts.)
#
# There are currently three modes defined, intended to be easy to understand and reason about.
#
# - normal: All features enabled for all of the given scripts.
# - scale: milestone posts disabled excepting for sharing levels, sharing enabled, puzzle rating
#     and hints disabled. Sampled hoc activity logging at 10%.
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
          public_max_age: 6.minutes.to_i,
          public_proxy_max_age: 3.minutes.to_i,
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
        public_max_age: 8.hours.to_i,
        public_proxy_max_age: 4.hours.to_i
      }
    },
    emergency: {
      gatekeeper_settings: {
        postMilestone: false,
        shareEnabled: true,
        puzzle_rating: false,
        hint_view_request: false
      },
      dcdo_settings: {
        hoc_activity_sample_weight: 10,
        public_max_age: 48.hours.to_i,
        public_proxy_max_age: 24.hours.to_i
      }
  }.with_indifferent_access

  # Returns the matching mode if the provided gatekeeper and settings match a predefined mode for
  # all of the specified script names, or nil otherwise.
  def self.get_mode(gatekeeper, dcdo, script_names)
    MODES.detect do |mode|
      settings_match_mode?(gatekeeper, dcdo, mode, script_names)
    end
  end

  def self.set_mode(gatekeeper, dcdo, script_names)
    settings = MODE_SETTINGS_MAP[mode]
    script_names.each do |script_name|
      settings[:gatekeeper_settings].each do |feature, value|
        gatekeeper.set(feature,  where: {script_name: script_name}, value: value)
      end
    end
    settings[:dcdo_settings].each do |key, value|
      dcdo.set(key, value)
    end
  end

  private

  # Return true if the given gatekeeper and dcdo settings match mode for all of the given
  # script_names.
  def self.settings_match_mode?(gatekeeper, dcdo, mode, script_names)
    gatekeeper_matches_mode?(gatekeeper, mode, script_names) &&
        dcdo_matches_mode?(dcdo, mode)
  end

  def self.gatekeeper_matches_mode?(gatekeeper, mode, script_names)
    expected_settings = MODE_SETTINGS_MAP[mode][:gatekeeper_settings]
    expected_settings.all? do |feature, expected_value|
      script_names.all? do |script|
        expected_value == gatekeeper.allows(feature, where: {script_name: script})
      end
    end
  end

  def self.dcdo_matches_mode?(dcdo, mode)
    expected_settings = MODE_SETTINGS_MAP[mode][:dcdo_settings]
    expected_settings.all? do |key, expected_value|
      expected_value == DCDO.get(key)
    end
  end

end