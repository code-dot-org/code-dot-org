class UserLessonObjectiveReflectionsController < ApplicationController
  before_action :authenticate_user!

  def create
    reflection = UserLessonObjectiveReflection.new(
      reflection_params.merge(student_id: current_user.id)
    )
    authorize! :create, reflection

    if reflection.save
      render json: reflection, status: :created
    else
      render json: {errors: reflection.errors.full_messages}, status: :unprocessable_entity
    end
  end

  private def reflection_params
    params.permit(:objective_id, :reflection)
  end
end
