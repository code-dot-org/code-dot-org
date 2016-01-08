require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'
require 'cdo/hip_chat'

class HocFeaturesController < ApplicationController
  before_filter :authenticate_user!

  # Model for the hoc features.
  class Features
    attr_accessor :level
  end

  def show
    authorize! :read, :reports
    @features = Features.new
  end

end