module Ops
  class WorkshopAttendanceController < OpsControllerBase
    respond_to :html, :xml, :json

    load_and_authorize_resource :segment, except: [:teacher, :cohort, :workshop]
    # Load shallow nested resource. See https://github.com/CanCanCommunity/cancancan/wiki/Nested-Resources#shallow-nesting
    load_and_authorize_resource through: :segment, through_association: :attendances, shallow: true
    skip_load_resource only: [:teacher, :cohort, :workshop]

    # GET /ops/attendance/teacher/1
    def teacher
      # ActiveRecord query with proper joins
      attendance_query = WorkshopAttendance.where(teacher_id: params.require(:teacher_id)).joins(segment: :workshop)

      # Build the structured hash object: [{:workshop => workshop, :segments => [:segment => segment, :attendance => attendance]}]
      segment_hash = attendance_query.map do |attendance|
        {segment: attendance.segment, attendance: attendance}
      end
      segment_group = segment_hash.group_by do |hash|
        hash[:segment].workshop
      end
      attendances = segment_group.map do |workshop, segments|
        {workshop: workshop, segments: segments}
      end
      respond_with attendances
    end

    # GET /ops/attendance/cohort/1
    # View attendance for all workshops in a cohort
    def cohort
      cohort = Cohort.includes(workshops: {segments: :attendances}).find(params.require(:cohort_id))
      respond_with cohort do |format|
        format.json { render json: cohort.as_json(include: {workshops: {include: {segments: {include: :attendances}}}}) }
      end
    end

    # GET /ops/attendance/workshop/1
    # View attendance for all segments in a single workshop
    def workshop
      workshop = Workshop.includes(segments: :attendances).find(params.require(:workshop_id))
      authorize! :workshop, workshop
      if params[:by_teacher]
        # ?by_teacher=1 to index the results by teacher_id
        by_teacher = workshop.segments.inject({}) do |hash, s|
          attendance = s.attendances.as_json(include: :segment).group_by { |a| a['teacher_id'] }
          hash.merge(attendance){|_,a,b| a+b}
        end
        respond_with by_teacher
      else
        respond_with workshop do |format|
          format.json { render json: workshop.as_json(include: {segments: {include: :attendances}}) }
        end
      end
    end

    # GET dashboardapi/attendance/download/:workshop_id
    def attendance
      @workshop = Workshop.includes(segments: :attendances).find(params.require(:workshop_id))

      respond_with (@workshop.teachers) do |format|
        format.csv do
          #Specify filename
          response.headers['Content-Disposition'] = 'attachment; filename="' + @workshop.name + '-Attendance.csv"'

          # Generate csv column headers dynamically
          header = ["User ID", "First Name", "Last Name", "E-mail", "District Name", "% Attended", "School Name"]
          segment_number = 0
          notes_headers = []
          @workshop.segments.each do |segment|
            header << ("#{segment.start.to_date}, #{segment.start.strftime('%H:%M')} #{segment.end.strftime('%H:%M')}")
            notes_headers << ("Segment #{segment_number + 1} notes")
            segment_number += 1
          end
          notes_headers.each do |note|
            header << note
          end
          # header << ("% Attended")

          # A 2d array. Each item is an array that represents a single row.
          teacher_info = []

          def format_teachers_for_csv(teachers, teacher_info)
            teachers.each do |teacher|
              number_attended = 0.0
              teacher_info_buffer = [teacher.id, teacher.ops_first_name, teacher.ops_last_name, teacher.email, teacher.district.name]
              teacher_segment_notes = []
              teacher_segment_status = []
              @workshop.segments.each do |segment|
                segment_info = WorkshopAttendance.find_by(segment_id: segment.id, teacher_id: teacher.id)
                if segment_info
                  if segment_info.status == "present" || segment_info.status == "excused"
                    number_attended += 1.0
                  end
                  teacher_segment_status << segment_info.status
                  teacher_segment_notes << segment_info.notes
                else
                  # Blank entries so csv doesn't get misaligned
                  teacher_segment_status << " "
                  teacher_segment_notes << " "
                end
              end
              teacher_info_buffer << (number_attended / @workshop.segments.length * 100).round
              teacher_info_buffer << teacher.ops_school
              teacher_segment_status.each do |status|
                teacher_info_buffer << status
              end
              teacher_segment_notes.each do |note|
                teacher_info_buffer << note
              end
              teacher_info << teacher_info_buffer
            end
          end

          format_teachers_for_csv(@workshop.teachers, teacher_info)
          format_teachers_for_csv(@workshop.unexpected_teachers, teacher_info)

          render text: CSV.generate(write_headers: true, headers: header) {|csv| teacher_info.each {|teacher| csv << teacher }}
        end
      end
    end

    # Batched version of #create.
    # POST /ops/segments/1/attendance/batch
    def batch
      attendances = params.require(:attendance)
      workshop = @segment.workshop
      teachers = workshop.teacher_ids
      attendances.each do |id, status, notes|
        raise("Teacher id #{id} not in workshop #{workshop.name}. Teachers: #{teachers}") unless teachers.include? id.to_i
        WorkshopAttendance.create_with(status: status, notes: notes).
            find_or_create_by(teacher_id: id, segment_id: @segment.id).
            update!(status: status, notes: notes)
      end
      render text: 'OK'
    end

    # POST /ops/segments/1/attendance
    def create
      @workshop_attendance.save!
      respond_with :ops, @workshop_attendance
    end

    # GET /ops/segments/1/attendance
    def index
      respond_with @workshop_attendances
    end

    # GET /ops/attendance/1
    def show
      respond_with @workshop_attendance
    end

    # PATCH/PUT /ops/attendance/1
    def update
      @workshop_attendance.update_attributes(workshop_attendance_params)
      respond_with @workshop_attendance
    end

    # DELETE /ops/attendance/1
    def destroy
      @workshop_attendance.destroy
      render text: 'OK'
    end

    private

    # Required for CanCanCan to work with strong parameters
    # (see: http://guides.rubyonrails.org/action_controller_overview.html#strong-parameters)
    def workshop_attendance_params
      params.require(:workshop_attendance).permit(
        :teacher_id,
        :segment_id,
        :status,
        :notes
      )
    end
  end
end
