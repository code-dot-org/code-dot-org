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
          hash.merge(attendance){|_,a,b|a+b}
        end
        respond_with by_teacher
      else
        respond_with workshop do |format|
          format.json { render json: workshop.as_json(include: {segments: {include: :attendances}}) }
        end
      end
    end

    # Batched version of #create.
    # POST /ops/segments/1/attendance/batch
    def batch
      attendances = params.require(:attendance)
      workshop = @segment.workshop
      teachers = workshop.teacher_ids
      attendances.each do |id, status|
        raise("Teacher id #{id} not in workshop #{workshop.name}. Teachers: #{teachers}") unless teachers.include? id.to_i
        WorkshopAttendance.create_with(status: status)
            .find_or_create_by(teacher_id: id, segment_id: @segment.id)
            .update!(status: status)
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
      @workshop_attendance.update_attributes(params[:workshop_attendance])
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
          :status
      )
    end
  end
end
