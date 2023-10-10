require 'cdo/firehose'

class Api::V1::SectionInstructorsController < Api::V1::JSONApiController
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
    puts "ERIC inside method #{section.reload.instructors.reload.length}"
    section.instructors.each do |instructor|
      puts instructor.inspect
    end
    return head :bad_request if SectionInstructor.where(section: section).count >= 6

    instructor = User.find_by(email: params.require(:email))
    return head :not_found if instructor.blank?
    return head :bad_request unless instructor.teacher?

    si = SectionInstructor.with_deleted.find_by(instructor: instructor, section: section)

    # Actually delete the instructor if they were soft-deleted so they can be re-invited.
    if si&.deleted_at.present?
      si.really_destroy!
    # Can't re-add someone who is already an instructor (or invited/declined)
    elsif si.present?
      return head :bad_request
    end

    si = SectionInstructor.create(
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
    si = SectionInstructor.find(params.require(:id))
    authorize! :manage, si.section

    # Can't remove the section owner
    return head :forbidden if si.instructor_id == si.section.user_id

    si.status = :removed
    si.save!
    si.destroy!

    head :no_content
  end

  # Accept one's own pending co-instructor invitation
  # PUT /section_instructors/:id/accept
  def accept
    resolve_invitation params.require(:id), :active
  end

  # Decline one's own pending co-instructor invitation
  # PUT /section_instructors/:id/decline
  def decline
    resolve_invitation params.require(:id), :declined
  end

  private def resolve_invitation(invitation_id, new_status)
    si = SectionInstructor.find(invitation_id)
    return head :forbidden if si.instructor_id != current_user.id
    return head :bad_request unless si.status == 'invited'

    si.status = new_status
    si.save!

    render json: si, serializer: Api::V1::SectionInstructorSerializer
  end
end
