class AdminDemoSectionsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  def index
    @script_data = {
      props: {
        demo_assignments: DemoAssignment.all.order(:demo_type).map do |da|
          student_users = User.where(id: da.demo_student_ids).index_by(&:id)
          {
            id: da.id,
            demo_type: da.demo_type,
            section_name: da.section_name,
            login_type: da.login_type,
            grades: da.grades,
            unit_name: da.unit_name,
            unit_group_name: da.unit_group_name,
            demo_students: da.demo_student_ids.map do |sid|
              user = student_users[sid]
              {id: sid, email: user&.email, username: user&.username, name: user&.name}
            end,
          }
        end,
      }.to_json
    }
  end

  def create
    da_params = params.permit(:demo_type, :section_name, :login_type, :unit_name, :unit_group_name, grades: [], demo_student_ids: [])
    return head :bad_request if da_params[:demo_type].blank?

    student_ids = (da_params[:demo_student_ids] || []).map(&:to_i)
    students = User.where(id: student_ids)
    if students.any? {|s| Policies::Lti.lti?(s)}
      return render json: {error: 'Demo sections cannot include LTI students'}, status: :bad_request
    end

    begin
      da = DemoAssignment.create!(
        demo_type: da_params[:demo_type],
        section_name: da_params[:section_name],
        login_type: da_params[:login_type],
        participant_type: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student,
        grades: da_params[:grades] || [],
        unit_name: da_params[:unit_name],
        unit_group_name: da_params[:unit_group_name],
        demo_student_ids: (da_params[:demo_student_ids] || []).map(&:to_i),
      )

      # Prevent login for demo students by clearing credentials
      students.each do |student|
        student.authentication_options.destroy_all
        student.update!(secret_words: nil)
        student.update!(secret_picture_id: nil)
        student.update!(encrypted_password: '')
      end

      student_users = User.where(id: da.demo_student_ids).index_by(&:id)
      render json: {
        id: da.id,
        demo_type: da.demo_type,
        section_name: da.section_name,
        login_type: da.login_type,
        grades: da.grades,
        unit_name: da.unit_name,
        unit_group_name: da.unit_group_name,
        demo_students: da.demo_student_ids.map do |sid|
          user = student_users[sid]
          {id: sid, email: user&.email, username: user&.username, name: user&.name}
        end,
      }
    rescue StandardError => exception
      render json: {error: exception.message}, status: :bad_request
    end
  end

  def destroy
    da = DemoAssignment.find(params[:id])
    da.destroy!
    head :no_content
  end

  # GET /admin/demo_sections/lookup_users?ids=1,2,3
  def lookup_users
    ids = (params[:ids] || '').split(',').map(&:to_i).reject(&:zero?)
    return render json: [] if ids.empty?

    users = User.where(id: ids).map do |user|
      {id: user.id, email: user.email, username: user.username, name: user.name}
    end

    render json: users
  end
end
