class AuthoredHintViewRequestsController < ApplicationController
  def create
    return head :unauthorized unless AuthoredHintViewRequest.enabled?
    return head :bad_request unless params.key?("hints") and params["hints"].respond_to?(:to_a)

    hints = params["hints"].to_a.map do |hint|
      hint[:user] = current_user
      hint.symbolize_keys
    end

    objects = AuthoredHintViewRequest.create(hints)
    valid_request = objects.all? do |object|
      object.valid?
    end

    unless valid_request
      objects.each do |object|
        puts object.errors.full_messages
      end
    end

    status_code = valid_request ? :created : :bad_request
    head status_code
  end
end
