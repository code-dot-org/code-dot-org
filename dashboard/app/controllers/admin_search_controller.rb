require 'digest/md5'

# The controller for seaching for and surfacing of internal admin data.
class AdminSearchController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  include SeamlessDatabasePool::ControllerFilter
  use_database_pool find_students: :persistent

  MAX_PAGE_SIZE = 50
  MAX_TOTAL_SIZE = 1000

  def find_students
    users = User.with_deleted

    # If requested, filter...
    if params[:studentNameFilter].present?
      users = users.where("name LIKE ?", "%#{params[:studentNameFilter]}%")
    end
    if params[:studentEmailFilter].present?
      hashed_email = User.hash_email params[:studentEmailFilter]
      users = users.where(hashed_email: hashed_email)
    end
    if params[:teacherNameFilter].present? || params[:teacherEmailFilter].present?
      teachers = User.
        where("name LIKE ?", "%#{params[:teacherNameFilter]}%").
        where("email LIKE ?", "%#{params[:teacherEmailFilter]}%").
        all
      if teachers.count > 1
        flash[:alert] = 'Multiple teachers matched the name and email search criteria.'
      end
      if teachers.first
        array_of_student_ids = teachers.first.students.pluck(:id)
        users = users.where(id: array_of_student_ids)
      end
    end
    if params[:sectionFilter].present?
      section = Section.with_deleted.find_by_code params[:sectionFilter]
      if section.nil?
        flash[:alert] = 'Section not found.'
      elsif section.deleted?
        flash[:alert] = 'Section is deleted.'
      end
      if section
        array_of_student_ids = section.students.pluck(:id)
        users = users.where(id: array_of_student_ids)
      end
    end
    @total_count = users.limit(MAX_TOTAL_SIZE).size
    @users = users.page(params[:page]).per(MAX_PAGE_SIZE)
  end

  def lookup_section
    @section = Section.with_deleted.find_by_code params[:section_code]
    if params[:section_code] && @section.nil?
      flash[:alert] = 'Section code not found'
    end
    if params[:section_code] && @section.try(:deleted?)
      flash[:alert] = 'Section is deleted'
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
