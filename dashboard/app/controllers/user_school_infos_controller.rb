class UserSchoolInfosController < ApplicationController
  def update
    user_school_info = UserSchoolInfo.find([:id])
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
