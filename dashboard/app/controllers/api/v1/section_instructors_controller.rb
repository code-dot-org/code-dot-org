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

    # Enforce maximum co-instructor count (the limit is 5 plus the main teacher
    # for a total of 6)
    if SectionInstructor.where(section: section).count >= 6
      return render json: {error: 'section full'}, status: :bad_request
    end

    instructor = User.find_by(email: params.require(:email), user_type: :teacher)
    return head :not_found if instructor.blank?

    si = SectionInstructor.with_deleted.find_by(instructor: instructor, section: section)

    # Actually delete the instructor if they were soft-deleted so they can be re-invited.
    if si&.deleted_at.present?
      si.really_destroy!
    # Can't re-add someone who is already an instructor (or invited/declined)
    elsif si.present?
      return render json: {error: 'already invited'}, status: :bad_request
    end

    si = SectionInstructor.create!(
      section: section,
      instructor: instructor,
      status: :invited,
      invited_by: current_user
    )

    render json: si, serializer: Api::V1::SectionInstructorSerializer
  end

  # Removes an instructor from the section (soft-deleting the record).
  # DELETE /section_instructors/:id
  def destroy
    # Can't remove the section owner
    return head :forbidden if @section_instructor.instructor_id == @section_instructor.section.user_id

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

  private def resolve_invitation(new_status)
    return head :bad_request unless @section_instructor.status == 'invited'

    @section_instructor.status = new_status
    @section_instructor.save!

    render json: @section_instructor, serializer: Api::V1::SectionInstructorSerializer
  end
end
