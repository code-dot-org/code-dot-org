require 'cdo/firehose'

class Api::V1::SectionInstructorsController < Api::V1::JSONApiController
  # GET /section_instructors
  def index
    section_instructors = SectionInstructor.where(instructor_id: current_user&.id)

    render json: section_instructors, each_serializer: Api::V1::SectionInstructorSerializer
  end

  # GET /section_instructors/:id
  def show
    section = Section.find(params.require(:id))
    authorize! :manage, section
    section_instructors = SectionInstructor.where(section: section)

    render json: section_instructors, each_serializer: Api::V1::SectionInstructorSerializer
  end

  # TODO: Finish this
  # POST /section_instructors
  def create
    section = Section.find(params.require(:section_id))
    authorize! :manage, section

    # instructor = User.find(params.require(:email))
  end

  # TODO: Destroy

  # TODO: Accept invitation
end
