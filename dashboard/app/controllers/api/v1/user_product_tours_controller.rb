class Api::V1::UserProductToursController < Api::V1::JSONApiController
  def create
    return head :unauthorized unless current_user

    tour_name = params.require(:tour_name)
    record = UserProductTour.find_or_initialize_by(user: current_user, tour_name: tour_name)

    if params.key?(:started_at)
      # Tour start event: create record the first time only.
      return head :ok if record.persisted?
      record.started_at = Time.now.utc
      record.properties = params[:properties]&.permit(:demo_type)&.to_h
      return render(json: {errors: record.errors.full_messages}, status: :unprocessable_entity) unless record.save
    else
      # Tour completion event: set completed_at if not already set.
      return head :ok if record.completed_at.present?
      record.completed_at = Time.now.utc
      return render(json: {errors: record.errors.full_messages}, status: :unprocessable_entity) unless record.save
    end

    head :ok
  rescue ActiveRecord::RecordNotUnique
    head :ok
  end
end
