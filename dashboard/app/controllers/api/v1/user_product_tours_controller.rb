class Api::V1::UserProductToursController < Api::V1::JSONApiController
  def create
    return head :unauthorized unless current_user

    tour_name = params.require(:tour_name)
    record = UserProductTour.find_or_initialize_by(user: current_user, tour_name: tour_name)

    unless record.persisted?
      record.completed_at = Time.now.utc
      unless record.save
        return render json: {errors: record.errors.full_messages}, status: :unprocessable_entity
      end
    end

    head :ok
  rescue ActiveRecord::RecordNotUnique
    head :ok
  end
end
