class TeachingProfileDataController < ApplicationController
  before_action :authenticate_user!

  # GET /teaching_profile_data
  def show
    existing_data = TeachingProfileData.find_by(user: current_user)

    if existing_data
      render json: {exists: true, data: existing_data.individual_data}, status: :ok
    else
      render json: {exists: false}, status: :ok
    end
  end

  # POST /teaching_profile_data
  def create
    @teaching_profile_data = TeachingProfileData.new(
      user: current_user,
      individual_data: params[:teaching_profile_data][:individual_data]
    )

    if @teaching_profile_data.save
      render json: {success: true, action: 'created'}, status: :created
    else
      render json: @teaching_profile_data.errors, status: :bad_request
    end
  end

  # PATCH /teaching_profile_data
  def update
    existing_data = TeachingProfileData.find_by(user: current_user)

    if existing_data
      if existing_data.update(individual_data: params[:teaching_profile_data][:individual_data])
        render json: {success: true, action: 'updated'}, status: :ok
      else
        render json: existing_data.errors, status: :unprocessable_entity
      end
    else
      render status: :not_found, json: "No teaching profile data found to update. Please create data first."
    end
  end
end
