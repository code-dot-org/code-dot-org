class UserLessonReflectionsController < ApplicationController
  before_action :authenticate_user!

  def create
    reflection = UserLessonReflection.new(
      reflection_params.merge(student_id: current_user.id)
    )
    authorize! :create, reflection

    if reflection.save
      render json: reflection, status: :created
    else
      render json: {errors: reflection.errors.full_messages}, status: :unprocessable_entity
    end
  end

  private

  def reflection_params
    params.permit(:lesson_id, :success, :struggle)
  end
end
