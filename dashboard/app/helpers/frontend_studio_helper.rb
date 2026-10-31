# frozen_string_literal: true

module FrontendStudioHelper
  # Same keys, order and keep_flashes handling as ApplicationHelper#show_flashes.
  def page_flash_json
    messages = {notice: flash.notice, info: flash[:info], alert: flash.alert}.filter_map do |type, message|
      {type: type, message: message} if message.present?
    end
    return nil if messages.empty?

    if session[:keep_flashes]
      session[:keep_flashes] = false
      flash.keep
    end
    messages.to_json
  end
end
