class UserSchoolInfosController < ApplicationController
  # PATCH /api/v1/users_school_infos/<id>/update_last_confirmation_date
  def update_last_confirmation_date
    user_school_info = UserSchoolInfo.find(params[:id])
    result = user_school_info.update ({
      last_confirmation_date: DateTime.now
    })
    if result
      head :no_content
    else
      render json: user_school_info.errors, status: :unprocessable_entity
    end
  end
end
