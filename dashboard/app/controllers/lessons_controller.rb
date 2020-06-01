class LessonsController < ApplicationController
  load_and_authorize_resource :lesson

  # DELETE /lessons/:lesson_id
  def destroy
    @lesson.destroy
    # TODO: also destroy the level
    head :no_content
  end
end
