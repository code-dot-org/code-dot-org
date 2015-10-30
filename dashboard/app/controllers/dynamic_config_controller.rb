require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'

class DynamicConfigController < ApplicationController
  before_filter :authenticate_user!

  def gatekeeper
    authorize! :read, :reports

    gatekeeper = {}
    state = Gatekeeper.datastore_cache.all

    state.each do |feature, rules|
      feature_details = []
      gatekeeper[feature] = feature_details
      rules.each do |conditions, value|
        rule = {"rule" => nil}

        conditions = JSON.load(conditions)
        if !conditions.empty?
          where_clause = {}
          rule['where'] = where_clause
          conditions.each do |property, value|
            where_clause[property] = value
          end
        end
        rule['value'] = value
        feature_details << rule
      end
    end
    gk_yaml = YAML.dump(gatekeeper)
    dcdo_yaml = YAML.dump(DCDO.datastore_cache.all)
    output = "# Gatekeeper Config\n #{gk_yaml}\n\n# DCDO Config\n#{dcdo_yaml}"
    render text: output, content_type: 'text/yaml'
  end
end
