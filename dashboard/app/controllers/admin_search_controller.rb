# The controller for seaching for and surfacing of internal admin data.
class AdminSearchController < ApplicationController
  before_filter :authenticate_user!
  before_action :require_admin
  check_authorization

  def lookup_section
    @section = Section.find_by_code params[:section_code]
    if params[:section_code] && @section.nil?
      flash[:alert] = 'Section code not found'
    end
  end

  def search_for_teachers
    SeamlessDatabasePool.use_persistent_read_connection do
      @teachers = User.where(user_type: 'teacher')

      # If requested, filter...
      if params[:emailFilter].present?
        @teachers = @teachers.where("email LIKE ?", "%#{params[:emailFilter]}%")
      end
      if params[:addressFilter].present?
        @teachers = @teachers.where("full_address LIKE ?", "%#{params[:addressFilter]}%")
      end
      # TODO(asher): Improve PD filtering.
      if params[:pd] == "pd"
        @teachers = @teachers.
                    joins("INNER JOIN workshop_attendance ON users.id = workshop_attendance.teacher_id").
                    distinct
      elsif params[:pd] == "nopd"
        @teachers = @teachers.
                    joins("LEFT OUTER JOIN workshop_attendance ON users.id = workshop_attendance.teacher_id").
                    where("workshop_attendance.teacher_id IS NULL").
                    distinct
      end
      if params[:unsubscribe].present?
        @teachers = @teachers.
                    joins("LEFT OUTER JOIN #{CDO.pegasus_db_name}.contacts ON users.email = #{CDO.pegasus_db_name}.contacts.email COLLATE utf8_unicode_ci").
                    where("#{CDO.pegasus_db_name}.contacts.email IS NULL OR #{CDO.pegasus_db_name}.contacts.unsubscribed_at IS NULL").
                    distinct
      end

      # TODO(asher): Determine whether we should be doing an inner join or a left
      # outer join.
      @teachers = @teachers.joins(:followers).group('followers.user_id')

      # Prune the set of fields to those that will be displayed.
      @teacher_limit = 500
      @headers = ['ID', 'Name', 'Email', 'Address', 'Num Students']
      @teachers = @teachers.limit(@teacher_limit).pluck('id', 'name', 'email', 'full_address', 'COUNT(followers.id) AS num_students')

      # Remove newlines from the full_address field, replacing them with spaces.
      @teachers.each do |teacher|
        if teacher[3].present?
          teacher[3].gsub!("\r", ' ')
          teacher[3].gsub!("\n", ' ')
        end
      end
    end
  end
end
