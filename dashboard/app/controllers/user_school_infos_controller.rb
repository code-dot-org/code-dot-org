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

  # PATCH /api/v1/users_school_infos/<id>/update_end_date_last_seen_school_info_interstitial
  def update_end_date_last_seen_school_info_interstitial
    user_school_info = UserSchoolInfo.find(params[:id])

    user_school_info.update!(end_date: DateTime.now)

    current_user.update!(properties: {last_seen_school_info_interstitial: DateTime.now})

    head :no_content
  end
end
