class AuthoredHintViewRequestsController < ApplicationController
  # Don't require an authenticity token because we post to this controller
  # from publicly cached level pages without valid tokens.
  skip_before_action :verify_authenticity_token

  def create
    return head :unauthorized unless AuthoredHintViewRequest.enabled?
    return head :bad_request unless params.key?("hints") && params["hints"].respond_to?(:to_a)

    hints = params["hints"].to_a.map do |hint|
      # add :user
      hint[:user] = current_user
      # convert camelCase strings to snake_case symbols
      hint.map{|key, value| {key.underscore.to_sym => value}}.reduce(:merge)
    end

    objects = AuthoredHintViewRequest.create(hints)
    all_valid = objects.all?(&:valid?)

    status_code = all_valid ? :created : :bad_request
    head status_code
  end
end
