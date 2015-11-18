class AuthoredHintViewRequestsController < ApplicationController
  def create
    return head :unauthorized unless AuthoredHintViewRequest.enabled?
    return head :bad_request unless params.key?("hints") && params["hints"].respond_to?(:to_a)

    hints = params["hints"].to_a.map do |hint|
      hint[:user] = current_user
      hint.symbolize_keys
    end

    objects = AuthoredHintViewRequest.create(hints)
    all_valid = objects.all? do |object|
      object.valid?
    end

    status_code = all_valid ? :created : :bad_request
    head status_code
  end
end
