require 'digest/md5'

# The controller for seaching for and surfacing of internal admin data.
class AdminSearchController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  MAX_PAGE_SIZE = 50

  def find_students
    SeamlessDatabasePool.use_persistent_read_connection do
      users = User.with_deleted

      # If requested, filter...
      if params[:studentNameFilter].present?
        users = users.where("name LIKE ?", "%#{params[:studentNameFilter]}%")
      end
      if params[:studentEmailFilter].present?
        hashed_email = Digest::MD5.hexdigest(params[:studentEmailFilter])
        users = users.where(hashed_email: hashed_email)
      end
      if params[:teacherNameFilter].present? || params[:teacherEmailFilter].present?
        teachers = User.
          where("name LIKE ?", "%#{params[:teacherNameFilter]}%").
          where("email LIKE ?", "%#{params[:teacherEmailFilter]}%").
          all
        if teachers.count > 1
          # TODO(asher): Display a warning to the admin that multiple teachers
          # matched.
        end
        if teachers.first
          array_of_student_ids = Follower.
            where(user: teachers.first).pluck('student_user_id').to_a
          users = users.where(id: array_of_student_ids)
        end
      end
      if params[:sectionFilter].present?
        array_of_student_ids = Section.where(code: params[:sectionFilter]).
          joins("INNER JOIN followers ON followers.section_id = sections.id").
          pluck('student_user_id').
          to_a
        users = users.where(id: array_of_student_ids)
      end

      @users = users.page(params[:page]).per(MAX_PAGE_SIZE)
    end
  end

  def lookup_section
    @section = Section.find_by_code params[:section_code]
    if params[:section_code] && @section.nil?
      flash[:alert] = 'Section code not found'
    end
  end

  def undelete_section
    section = Section.with_deleted.find_by_code params[:section_code]
    if section.try(:deleted?)
      section.restore(recursive: true, recovery_window: 5.minutes)
      flash[:alert] = "Section (CODE: #{params[:section_code]}) undeleted!"
    else
      flash[:alert] = "Section (CODE: #{params[:section_code]}) not found or undeleted."
    end
    redirect_to :lookup_section
  end
end
