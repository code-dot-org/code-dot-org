require 'cdo/firehose'

class TransfersController < ApplicationController
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token

  # POST /sections/transfers
  def create
    new_section_code = params[:new_section_code]
    current_section_code = params[:current_section_code]
    unless new_section_code && current_section_code
      return head :bad_request
    end

    stay_enrolled_in_current_section = params[:stay_enrolled_in_current_section]
    if stay_enrolled_in_current_section.nil?
      return head :bad_request
    end

    student_ids = params[:student_ids].try(:map, &:to_i)
    if student_ids.nil? || student_ids.empty?
      render json: {
        error: I18n.t('move_students.student_ids_not_entered')
      }, status: :bad_request
      return
    end

    # Rather than noop, we return a bad_request if the source and destination sections are the same.
    if new_section_code == current_section_code
      render json: {
        error: I18n.t('move_students.section_code_cant_be_current_section')
      }, status: :bad_request
      return
    end
    # Verify the destination section is not managed by a third-party login
    new_section = Section.find_by_code(new_section_code)
    if new_section && new_section.externally_rostered?
      render json: {
        error: I18n.t('move_students.third_party_login')
      }, status: :bad_request
      return
    end
    # Verify the destination section and destination teacher exist (are not soft-deleted).
    unless new_section && new_section.user
      render json: {
        error: I18n.t('move_students.new_section_dne', new_section_code: new_section_code)
      }, status: :not_found
      return
    end
    # Verify the source section exists (is not soft-deleted).
    current_section = Section.find_by_code(current_section_code)
    unless current_section
      render json: {
        error: I18n.t('move_students.current_section_dne', current_section_code: current_section_code)
      }, status: :not_found
      return
    end

    if new_section.will_be_over_capacity?(params[:student_ids].size)

      FirehoseClient.instance.put_record(
        :analysis,
        {
          study: 'section capacity restriction',
          event: "Section owner attempted to #{params[:stay_enrolled_in_current_section] ? 'copy' : 'move'} #{params[:student_ids].size > 1 ? 'multiple students' : 'a student'} to a full section",
          data_json: {
            section_id: new_section.id,
            section_code: new_section.code,
            date: "#{Time.now.month}/#{Time.now.day}/#{Time.now.year} at #{Time.now.hour}:#{Time.now.min}",
            joiner_id: params[:student_ids],
            section_teacher_id: new_section.user_id
          }.to_json
        }
      )

      render json: {
        result: 'full',
        verb: params[:stay_enrolled_in_current_section] ? 'copy' : 'move',
        sectionCapacity: new_section.capacity,
        sectionCode: new_section.code,
        numStudents: params[:student_ids].size,
        sectionStudentCount: new_section.summarize[:numberOfStudents]
      }, status: :forbidden
      return
    end

    new_section = Section.find_by_code(params[:new_section_code])

    if new_section.will_be_over_capacity?(params[:student_ids].size)

      FirehoseClient.instance.put_record(
        :analysis,
        {
          study: 'section capacity restriction',
          event: "Section owner attempted to #{params[:stay_enrolled_in_current_section] ? 'copy' : 'move'} #{params[:student_ids].size > 1 ? 'multiple students' : 'a student'} to a full section",
          data_json: {
            section_id: new_section.id,
            section_code: new_section.code,
            date: "#{Time.now.month}/#{Time.now.day}/#{Time.now.year} at #{Time.now.hour}:#{Time.now.min}",
            joiner_id: params[:student_ids],
            section_teacher_id: new_section.user_id
          }.to_json
        }
      )

      render json: {
        result: 'full',
        verb: params[:stay_enrolled_in_current_section] ? 'copy' : 'move',
        sectionCapacity: new_section.capacity
      }, status: :forbidden
      return
    end

    # TODO(asher): Determine if this should be :manage (currently not granted) instead of :read.
    authorize! :read, current_section

    students = User.where(id: student_ids).all
    if students.count != student_ids.count
      render json: {
        error: I18n.t('move_students.student_not_found')
      }, status: :not_found
      return
    end

    if student_ids.count != current_user.followers.where(section_id: current_section.id, student_user_id: student_ids).count
      render json: {
        error: I18n.t('move_students.all_students_must_be_in_current_section')
      }, status: :forbidden
      return
    end

    if students.any? {|student| Follower.exists?(section: new_section, student_user: student)}
      render json: {
        error: I18n.t('move_students.already_enrolled_in_new_section')
      }, status: :bad_request
      return
    end

    stay_enrolled_in_current_section = params[:stay_enrolled_in_current_section] &&
      params[:stay_enrolled_in_current_section] != 'false'
    students.each do |student|
      if new_section.user == current_user
        follower_same_user_teacher = student.followeds.find_by_section_id(current_section.id)
        follower_same_user_teacher.update_attributes!(section_id: new_section.id)
      else
        unless student.followeds.exists?(section_id: new_section.id)
          student.followeds.create!(user: new_section.user, section: new_section)
        end

        unless stay_enrolled_in_current_section
          student.followeds.find_by_section_id(current_section.id).destroy
        end
      end

      student.assign_script(new_section.script) if new_section.script
    end

    render json: {}, status: :no_content
  end
end
