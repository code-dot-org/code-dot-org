class AuthoredHintViewRequestsController < ApplicationController
  # Don't require an authenticity token because we post to this controller
  # from publicly cached level pages without valid tokens.
  skip_before_action :verify_authenticity_token

  def create
    return head :unauthorized unless AuthoredHintViewRequest.enabled?
    unless params.key?("hints") && params["hints"].respond_to?(:to_a)
      return head :bad_request
    end
    # TODO(elijah): After fixing the client-side, change this to :bad_request,
    # updating the appropriate test.
    return head :accepted unless current_user

    hints = params.permit(hints: [:scriptId, :levelId, :hintId]).require(:hints)
    hints.each do |hint|
      # Add :user.
      hint[:user] = current_user
      # Convert camelCase strings to snake_case symbols.
      hint.transform_keys!{|key| key.underscore.to_sym}
    end

    objects = AuthoredHintViewRequest.create(hints)
    all_valid = objects.all?(&:valid?)

    pairing_user_ids.each do |paired_user_id|
      # Ignore errors here.
      AuthoredHintViewRequest.create(
        hints.map{ |hint| hint.merge(user_id: paired_user_id) }
      )
    end

    status_code = all_valid ? :created : :bad_request
    head status_code
  end
end
