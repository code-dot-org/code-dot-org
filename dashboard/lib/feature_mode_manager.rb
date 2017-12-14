# A class that defines "feature modes" for Gatekeeper and DCDO configuration. There are currently
# three modes defined. The "normal" mode is intended for use throughout most of the year, the
# "scale" mode is intended for use during the hour of code (when we peak at 10x normal traffic),
# and the "emergency" mode is for use during severe database overload.
#
# Below are the groupings of features that are enabled at each scale level:
#
# normal:
#     Enable all features.
# scale:
#     Save progress only on sharable or non-hoc levels.
#     Disable puzzle rating and hints for all tutorials.
#     Log hoc activity with 10% sampling.
#     Extend cache lifetimes for HOC pages.
# emergency:
#     Same as Scale, plus all progress tracking and sharing disabled.

require 'cdo/chat_client'

class FeatureModeManager
  # A map from mode symbol to gatekeeper and dcdo settings. The gatekeeper settings are
  # broken down into gatekeeper_general_settings (which apply to all tutorials) and
  # gatekeeper_hoc_tutorial_settings (which apply to high-scale HOC tutorials only).
  MODE_SETTINGS_MAP = {
    normal: {
      gatekeeper_general_settings: {
        puzzle_rating: true,
        hint_view_request: true,
        postMilestone: true,
        postFailedRunMilestone: true,
        shareEnabled: true,
        slogging: true
      },
      gatekeeper_hoc_tutorial_settings: {
        postMilestone: true,
        postFailedRunMilestone: true,
        shareEnabled: true,
      },
      gatekeeper_csf_tutorial_settings: {
        postMilestone: true,
        postFailedRunMilestone: true,
        shareEnabled: true,
      },
      dcdo_settings: {
        hoc_activity_sample_weight: 1,
        hoc_learn_activity_sample_weight: 1,
        public_proxy_max_age: 3.minutes.to_i,
        public_max_age: 6.minutes.to_i,
      }
    },
    scale: {
      gatekeeper_general_settings: {
        puzzle_rating: true,
        hint_view_request: true,
        postMilestone: true,
        postFailedRunMilestone: true,
        shareEnabled: true,
        slogging: false
      },
      gatekeeper_hoc_tutorial_settings: {
        postMilestone: true,
        postFailedRunMilestone: true,
        shareEnabled: true,
      },
      gatekeeper_csf_tutorial_settings: {
        postMilestone: true,
        postFailedRunMilestone: true,
        shareEnabled: true,
      },
      dcdo_settings: {
        hoc_activity_sample_weight: 1,
        hoc_learn_activity_sample_weight: 50,
        public_proxy_max_age: 4.hours.to_i,
        public_max_age: 8.hours.to_i,
      }
    },
    fallback: {
      gatekeeper_general_settings: {
        puzzle_rating: false,
        hint_view_request: true,
        postMilestone: true,
        postFailedRunMilestone: true,
        shareEnabled: true,
        slogging: false
      },
      gatekeeper_hoc_tutorial_settings: {
        postMilestone: true,
        postFailedRunMilestone: false,
        shareEnabled: true,
      },
      gatekeeper_csf_tutorial_settings: {
        postMilestone: true,
        postFailedRunMilestone: true,
        shareEnabled: true,
      },
      dcdo_settings: {
        hoc_activity_sample_weight: 1,
        hoc_learn_activity_sample_weight: 50,
        public_proxy_max_age: 4.hours.to_i,
        public_max_age: 8.hours.to_i,
      }
    },
    emergency: {
      gatekeeper_general_settings: {
        puzzle_rating: false,
        hint_view_request: false,
        postMilestone: true,
        postFailedRunMilestone: true,
        shareEnabled: true,
        slogging: false
      },
      gatekeeper_hoc_tutorial_settings: {
        postMilestone: false,
        postFailedRunMilestone: false,
        shareEnabled: true,
      },
      gatekeeper_csf_tutorial_settings: {
        postMilestone: false,
        postFailedRunMilestone: false,
        shareEnabled: true,
      },
      dcdo_settings: {
        hoc_activity_sample_weight: 10,
        hoc_learn_activity_sample_weight: 0,
        public_proxy_max_age: 24.hours.to_i,
        public_max_age: 48.hours.to_i,
      }
    }
  }.with_indifferent_access

  # An array of supported feature mode names.
  MODES = MODE_SETTINGS_MAP.keys

  # Updates the feature mode to the given mode.
  def self.set_mode(mode, gatekeeper, dcdo, hoc_script_names, csf_script_names)
    settings = MODE_SETTINGS_MAP[mode]
    raise "Invalid mode '#{mode}'" if settings.nil?

    settings[:dcdo_settings].each do |key, value|
      dcdo.set(key, value)
    end

    settings[:gatekeeper_general_settings].each do |feature, value|
      gatekeeper.set(feature,  value: value)
    end

    settings[:gatekeeper_hoc_tutorial_settings].each do |feature, value|
      hoc_script_names.each do |script_name|
        gatekeeper.set(feature,  where: {script_name: script_name}, value: value)
      end
    end

    settings[:gatekeeper_csf_tutorial_settings].each do |feature, value|
      csf_script_names.each do |script_name|
        gatekeeper.set(feature,  where: {script_name: script_name}, value: value)
      end
    end

    ChatClient.log "Set scale feature mode for environment #{Rails.env} to #{mode}"
  end

  # Returns the matching mode if the dcdo and gatekeeper settings match
  # a predefined mode for all of the specified HOC script names, or nil otherwise.
  def self.get_mode(gatekeeper, dcdo, hoc_script_names, csf_script_names)
    MODES.detect do |mode|
      dcdo_matches_mode?(dcdo, mode) &&
        gatekeeper_general_settings_match_mode?(gatekeeper, mode) &&
        gatekeeper_hoc_tutorials_match_mode?(gatekeeper, mode, hoc_script_names) &&
        gatekeeper_csf_tutorials_match_mode?(gatekeeper, mode, csf_script_names)
    end
  end

  # Returns true if the feature mode manager allows the `feature` in `mode` for hoc tutorial
  # `script`, falling through to the value from the Gatekeeper if the manager doesn't
  # specify a value.  (If script is nil, only considers general settings.)
  def self.allows(gatekeeper, mode, feature, script)
    # Use the value from the mode settings map, if defined.
    settings = MODE_SETTINGS_MAP[mode]
    if settings
      if script
        if ScriptConfig.hoc_scripts.include?(script)
          allowed = settings[:gatekeeper_hoc_tutorial_settings][feature]
        elsif ScriptConfig.csf_scripts.include?(script)
          allowed = settings[:gatekeeper_csf_tutorial_settings][feature]
        end
      end
      allowed = settings[:gatekeeper_general_settings][feature] if allowed.nil?
      return allowed unless allowed.nil?
    end

    # Otherwise use the value from the Gatekeeper.
    gatekeeper.allows(feature, where: (script ? {script_name: script} : {}))
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

  def self.gatekeeper_hoc_tutorials_match_mode?(gatekeeper, mode, hoc_script_names)
    gatekeeper_tutorials_match_mode?(gatekeeper, hoc_script_names,
      MODE_SETTINGS_MAP[mode][:gatekeeper_hoc_tutorial_settings]
    )
  end

  def self.gatekeeper_csf_tutorials_match_mode?(gatekeeper, mode, csf_script_names)
    gatekeeper_tutorials_match_mode?(gatekeeper, csf_script_names,
      MODE_SETTINGS_MAP[mode][:gatekeeper_csf_tutorial_settings]
    )
  end

  def self.gatekeeper_tutorials_match_mode?(gatekeeper, script_names, expected_settings)
    expected_settings.all? do |feature, expected_value|
      script_names.all? do |script|
        expected_value == gatekeeper.allows(feature, where: {script_name: script})
      end
    end
  end
end
