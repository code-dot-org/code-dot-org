class Api::V1::SectionInstructorsController < Api::V1::JSONApiController
  load_and_authorize_resource only: [:destroy, :accept, :decline]

  # Returns list of current user's SectionInstructor records
  # GET /section_instructors
  def index
    section_instructors = SectionInstructor.where(instructor_id: current_user&.id)

    render json: section_instructors, each_serializer: Api::V1::SectionInstructorSerializer
  end

  # Returns SectionInstructor records for the given section
  # GET /section_instructors/:section_id
  def show
    section = Section.find(params.require(:section_id))
    authorize! :manage, section
    section_instructors = SectionInstructor.where(section: section)

    render json: section_instructors, each_serializer: Api::V1::SectionInstructorSerializer
  end

  # Adds a new teacher as an invited instructor
  # POST /section_instructors
  def create
    section = Section.find(params.require(:section_id))
    authorize! :manage, section

    begin
      si = section.invite_instructor(params.require(:email), current_user)
      render json: si, serializer: Api::V1::SectionInstructorSerializer
    rescue ArgumentError => exception
      render json: {error: exception.message}, status: :bad_request
    rescue ActiveRecord::RecordNotFound
      head :not_found
    end
  end

  # Removes an instructor from the section (soft-deleting the record).
  # DELETE /section_instructors/:id
  def destroy
    @section_instructor.status = :removed
    @section_instructor.save!
    @section_instructor.destroy!

    head :no_content
  end

  # Accept one's own pending co-instructor invitation
  # PUT /section_instructors/:id/accept
  def accept
    resolve_invitation :active
  end

  # Decline one's own pending co-instructor invitation
  # PUT /section_instructors/:id/decline
  def decline
    resolve_invitation :declined
  end

  # GET /section_instructors/check
  # Checks if the given email address corresponds to a user that could be added
  # as an instructor. Optional section id parameter can be given to verify that
  # the user is not already an instructor in the section.
  def check
    return head :forbidden unless current_user&.teacher?

    instructor = User.find_by(email: params.require(:email), user_type: :teacher)
    return head :not_found if instructor.blank?
    if instructor == current_user
      return render json: {error: 'inviting self'}, status: :bad_request
    end

    section = Section.find_by_id(params[:section_id])
    if section.present?
      authorize! :manage, section

      begin
        section.validate_instructor(instructor)
      rescue ArgumentError => exception
        return render json: {error: exception.message}, status: :bad_request
      end
    end

    head :no_content
  end

  private def resolve_invitation(new_status)
    return head :bad_request unless @section_instructor.status == 'invited'

    @section_instructor.status = new_status
    @section_instructor.save!

    render json: @section_instructor, serializer: Api::V1::SectionInstructorSerializer
  end
end
