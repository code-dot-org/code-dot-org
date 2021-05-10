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

  def pilots
    @pilots = Pilot.all
  end

  def create_pilot
    pilot_params = params[:pilot]
    return head :bad_request unless pilot_params

    begin
      Pilot.create!(
        name: pilot_params[:name],
        display_name: pilot_params[:display_name],
        allow_joining_via_url: pilot_params[:allow_joining_via_url]
      )
    rescue StandardError => e
      return render status: :bad_request, json: {error: e.message}
    end

    redirect_to :pilots
  end

  def show_pilot
    @pilot_name = params[:pilot_name]
    return head :bad_request unless Pilot.exists?(name: @pilot_name)
    user_ids =  SingleUserExperiment.where(name: @pilot_name).map(&:min_user_id)
    @emails = User.where(id: user_ids).pluck(:email)
  end

  # Parses newline separated emails, ignores commas and whitespace
  def add_to_pilot
    emails = params[:email]
    pilot_name = params[:pilot_name]
    return head :bad_request unless Pilot.exists?(name: pilot_name)
    email_array = emails.split("\n")
    email_array.each do |email|
      email = email.strip.gsub(/[\s,]/, "")
      user = User.find_by_email_or_hashed_email(email)
      if !user
        flash[:alert] = "An account with the email address #{email} does not exist"
      elsif user.student?
        flash[:alert] = "Cannot add a student to the pilot"
      else
        SingleUserExperiment.find_or_create_by!(min_user_id: user.id, name: pilot_name)
        flash[:notice] = "Successfully added #{email} to #{pilot_name}!"
      end
    end
    redirect_to action: 'show_pilot', pilot_name: pilot_name
  end
end
