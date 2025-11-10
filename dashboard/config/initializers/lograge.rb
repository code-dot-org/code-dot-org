# frozen_string_literal: true

require 'request_store'

Rails.application.configure do
  config.lograge.custom_options = lambda do |event|
    request_id = event.payload[:request_id] || RequestStore.store[:request_id]
    user_id = event.payload[:user_id]
    admin_id = event.payload[:admin_id]

    {}.tap do |options|
      options[:request_id] = request_id if request_id
      options[:user_id] = user_id if user_id
      options[:admin_id] = admin_id if admin_id
    end
  end
end
