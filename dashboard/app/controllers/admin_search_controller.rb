# The controller for seaching for and surfacing of internal admin data.
class AdminSearchController < ApplicationController
  before_filter :authenticate_user!, except: [:header_stats]

  check_authorization except: [:header_stats, :students]

  def lookup_section
    authorize! :manage, :all
    @section = Section.find_by_code params[:section_code]
    if params[:section_code] && @section.nil?
      flash[:alert] = 'Section code not found'
    end
  end

  def search_for_teachers
    authorize! :read, :reports

    SeamlessDatabasePool.use_persistent_read_connection do
      email_filter = "%#{params[:emailFilter]}%"
      address_filter = "%#{params[:addressFilter]}%"

      # TODO(asher): Determine whether we should be doing an inner join or a left
      # outer join.
      @teachers = User.where(user_type: 'teacher').where("email LIKE ?", email_filter).where("full_address LIKE ?", address_filter).joins(:followers).group('followers.user_id')

      # If requested, join with the workshop_attendance table to filter out based
      # on PD attendance.
      if params[:pd] == "pd"
        @teachers = @teachers.joins("INNER JOIN workshop_attendance ON users.id = workshop_attendance.teacher_id").distinct
      elsif params[:pd] == "nopd"
        @teachers = @teachers.joins("LEFT OUTER JOIN workshop_attendance ON users.id = workshop_attendance.teacher_id").where("workshop_attendance.teacher_id IS NULL").distinct
      end

      # Prune the set of fields to those that will be displayed.
      @teacher_limit = 500
      @headers = ['ID', 'Name', 'Email', 'Address', 'Num Students']
      @teachers = @teachers.limit(@teacher_limit).pluck('id', 'name', 'email', 'full_address', 'COUNT(followers.id) AS num_students')

      # Remove newlines from the full_address field, replacing them with spaces.
      @teachers.each do |teacher|
        teacher[3].gsub!("\r", ' ')
        teacher[3].gsub!("\n", ' ')
      end
    end
  end
end
