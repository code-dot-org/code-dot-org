require 'cdo/chat_client'
require 'dynamic_config/dcdo'
require 'dynamic_config/gatekeeper'
require 'oj'

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
    where = JSON.parse(params[:where]) || {}
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

  def dcdo_show
    authorize! :read, :reports
    DCDO.refresh

    @dcdo_hsh = DCDO.to_h
  end

  def dcdo_set
    authorize! :read, :reports
    DCDO.refresh

    params.require([:key, :data_type])
    key = params[:key]
    raw_value = params[:value]
    data_type = params[:data_type]

    begin
      value =
        case data_type
          when "Integer"
            Integer(raw_value)
          when "Float"
            Float(raw_value)
          when "Boolean"
            raw_value.to_bool
          when "String"
            raw_value
          else
            new_value = Oj.load(raw_value)
            if new_value.class.to_s != data_type
              raise "#{new_value} does not match data type \"#{data_type}\""
            end
            new_value
        end

      DCDO.set(key, value)

      log_msg = "<b>DCDO - #{key}</b> #{current_user.name} set to #{value}"
      ChatClient.log log_msg
      flash[:notice] = "Updated successfully! Remember your changes take 30 seconds to go into effect, so don't expect to see the changes immediately on this page."
      redirect_to action: :dcdo_show
    rescue Oj::ParseError, NoMethodError, ArgumentError => e
      flash[:alert] = "Failed to update, value and data type mismatch: #{e}"
      redirect_to action: :dcdo_show
    rescue StandardError => e
      flash[:alert] = "Failed to update: #{e}"
      redirect_to action: :dcdo_show
    end
  end
end
