class AuthoredHintViewRequestsController < ApplicationController
  # Don't require an authenticity token because we post to this controller
  # from publicly cached level pages without valid tokens.
  skip_before_action :verify_authenticity_token

  def create
    return head :unauthorized unless AuthoredHintViewRequest.enabled?
    return head :bad_request unless params.key?("hints") && params["hints"].respond_to?(:to_a)

    hints = params.permit(hints: [:scriptId, :levelId, :hintId]).require(:hints)
    hints.each do |hint|
      # add :user
      hint[:user] = current_user
      # convert camelCase strings to snake_case symbols
      hint.transform_keys!{|key| key.underscore.to_sym}
    end

    objects = AuthoredHintViewRequest.create(hints)
    all_valid = objects.all?(&:valid?)

    pairing_user_ids.each do |paired_user_id|
      # Ignore errors here.
      AuthoredHintViewRequest.create(hints.map{ |hint| hint.merge(user_id: paired_user_id) })
    end

    status_code = all_valid ? :created : :bad_request
    head status_code
  end
end
