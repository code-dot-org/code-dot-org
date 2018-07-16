class AuthoredHintViewRequestsController < ApplicationController
  # Don't require an authenticity token because we post to this controller
  # from publicly cached level pages without valid tokens.
  skip_before_action :verify_authenticity_token

  def create
    return head :unauthorized unless AuthoredHintViewRequest.enabled? && current_user
    unless params.key?("hints") && params["hints"].respond_to?(:to_a)
      return head :bad_request
    end

    fields = [
      :scriptId,
      :levelId,
      :hintId,
      :hintClass,
      :hintType,
      :prevTime,
      :prevAttempt,
      :prevTestResult,
      :prevLevelSourceId,
      :nextTime,
      :nextAttempt,
      :nextTestResult,
      :nextLevelSourceId,
      :finalTime,
      :finalAttempt,
      :finalTestResult,
      :finalLevelSourceId,
    ]

    hints = params.permit(hints: fields).require(:hints)

    hints.each do |hint|
      # Add :user.
      hint[:user] = current_user
      # Convert camelCase to snake_case.
      hint.transform_keys!(&:underscore)
    end

    objects = AuthoredHintViewRequest.create(hints)
    all_valid = objects.all?(&:valid?)

    pairing_user_ids.each do |paired_user_id|
      # Ignore errors here.
      AuthoredHintViewRequest.create(
        hints.map {|hint| hint.merge(user_id: paired_user_id)}
      )
    end

    status_code = all_valid ? :created : :bad_request
    head status_code
  end
end
