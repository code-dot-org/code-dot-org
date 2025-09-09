require 'oj'

require 'cdo/chat_client'
require 'dynamic_config/dcdo'

class DcdoController < ApplicationController
  before_action :authenticate_user!

  def show
    authorize! :read, :reports
    DCDO.refresh

    @dcdo_hsh = DCDO.to_h
  end

  def update
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
      redirect_to action: :show
    rescue Oj::ParseError, NoMethodError, ArgumentError => exception
      flash[:alert] = "Failed to update, value and data type mismatch: #{exception}"
      redirect_to action: :show
    rescue StandardError => exception
      flash[:alert] = "Failed to update: #{exception}"
      redirect_to action: :show
    end
  end
end
