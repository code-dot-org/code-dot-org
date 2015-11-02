require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'

class DynamicConfigController < ApplicationController
  before_filter :authenticate_user!

  def show
    authorize! :read, :reports

    gk_yaml = Gatekeeper.to_yaml
    dcdo_yaml = DCDO.to_yaml
    output = "# Gatekeeper Config\n #{gk_yaml}\n\n# DCDO Config\n#{dcdo_yaml}"
    render text: output, content_type: 'text/yaml'
  end
end
