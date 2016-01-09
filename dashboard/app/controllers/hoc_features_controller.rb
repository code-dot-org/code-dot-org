require 'cdo/hip_chat'

class HocFeaturesController < ApplicationController
  before_filter :authenticate_user!


  # Model for the hoc features.
  class Features
    MODES = %w{normal scale emergency}

    def self.determine_mode_for_scripts(gatekeeper, script_names)
      mode = MODES.detect do |mode|
        gatekeeper_settings_match_mode(gatekeeper, mode, script_names )
      end
      mode || 'custom'
    end

    def self.gatekeeper_settings_match_mode(gatekeeper, mode, script_names)
      expected_settings = gatekeeper_settings_for_mode(mode)
      script_names.all? do |script|
        expected_settings.all? do |feature, expected_value|
          expected_value == gatekeeper.allows(feature, where: {script_name: script})
        end
      end
    end

    def self.gatekeeper_settings_for_mode(mode)
      case mode
        when 'normal'
          {
              postMilestone: true,
              shareEnabled: true,
              puzzle_rating: true,
              hint_view_request: true,
              hoc_activity_sample_weight: 1
          }
        when 'scale'
          {
              postMilestone: false,
              shareEnabled: true,
              puzzle_rating: false,
              hint_view_request: false,
              hoc_activity_sample_weight: 10
          }
        when 'emergency'
          {
              postMilestone: false,
              shareEnabled: true,
              puzzle_rating: false,
              hint_view_request: false,
              hoc_activity_sample_weight: 10
          }
        else
          raise "Unexpected mode #{mode}"
      end
    end



  end




  def show
    authorize! :read, :reports
    @features = Features.new
    @features.level = 'normal'
  end

end