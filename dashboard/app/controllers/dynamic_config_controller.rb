require 'cdo/chat_client'
require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'

class DynamicConfigController < ApplicationController
  before_action :authenticate_user!

  def show
    authorize! :read, :reports
    gk_yaml = Gatekeeper.to_yaml
    dcdo_yaml = DCDO.to_yaml
    output = "# Gatekeeper Config\n #{gk_yaml}\n\n# DCDO Config\n#{dcdo_yaml}"
    render plain: output, content_type: 'text/yaml'
  end

  def gatekeeper_show
    authorize! :read, :reports
    Gatekeeper.refresh

    @gk_hsh = Gatekeeper.to_hash
    if params[:feature]
      @feature = params[:feature]
      @feature_details = @gk_hsh[params[:feature]]
    end
  end

  def gatekeeper_delete
    authorize! :read, :reports
    Gatekeeper.refresh

    params.require(:feature)
    feature = params[:feature]
    where = JSON.load(params[:where]) || {}
    log_msg = "<b>Gatekeeper - #{feature}</b> #{current_user.name} deleted rule where #{where}"
    ChatClient.log log_msg
    Gatekeeper.delete(feature, where: where)
    flash[:notice] = "Deleted successfully! Remember your changes take 30 seconds to go into effect, so don't expect to see the changes immediately on this page."
    redirect_to action: :gatekeeper_show, feature: feature
  end

  def gatekeeper_set
    authorize! :read, :reports
    Gatekeeper.refresh

    params.require(:feature)
    feature = params[:feature]
    where = {}
    where_count = 0

    loop do
      where_key = params["where_key_#{where_count}"]
      where_value = params["where_value_#{where_count}"]

      break if where_key.nil? || where_value.nil?
      where[where_key] = JSONValue.value(where_value)
      where_count += 1
    end

    value = JSONValue.value(params[:value])
    Gatekeeper.set(feature, where: where, value: value)

    log_msg = "<b>Gatekeeper - #{feature}</b> #{current_user.name} set #{where} to #{value}"
    ChatClient.log log_msg

    flash[:notice] = "Updated successfully! Remember your changes take 30 seconds to go into effect, so don't expect to see the changes immediately on this page."
    redirect_to action: :gatekeeper_show, feature: feature
  end
end
