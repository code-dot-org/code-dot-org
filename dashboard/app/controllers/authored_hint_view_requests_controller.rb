class AuthoredHintViewRequestsController < ApplicationController
  def create
    return head :unauthorized unless AuthoredHintViewRequest.enabled?
    return head :bad_request unless params.key?("hints") && params["hints"].respond_to?(:to_a)

    puts params["hints"]
    hints = params["hints"].to_a.map do |hint|
      # convert camelCase strings to snake_case symbols
      hint = Hash[hint.map{ |key, value| [key.underscore.to_sym, value] }]
      # add :user
      hint[:user] = current_user
    end
    puts hints

    objects = AuthoredHintViewRequest.create(hints)
    all_valid = objects.all? do |object|
      object.valid?
    end

    status_code = all_valid ? :created : :bad_request
    head status_code
  end
end
