# Controller concern for common Pd::Workshop loading and filtering methods
# To use, include in a controller and call the desired method.
module Pd::WorkshopFilters
  extend ActiveSupport::Concern

  # Query by either:
  #   schedule - the workshop's scheduled start date (date of first session)
  #   end - the date the workshop was ended
  QUERY_BY_SCHEDULE = 'schedule'.freeze
  QUERY_BY_END = 'end'.freeze

  # Currently only csf is needed. This can be extended in the future.
  COURSE_MAP = {
    csf: Pd::Workshop::COURSE_CSF
  }.stringify_keys.freeze

  # Loads workshops that have ended, filtered based on query params:
  #  - end_date
  #  - start_date
  #  - query_by: 'schedule' or 'end', determines how start_date and end_date are used
  #  - course: null (all), 'csf', or '-csf' (not CSF)
  def load_filtered_ended_workshops
    # Default to the last week, by schedule
    end_date = params[:end] || Date.today
    start_date = params[:start] || end_date - 1.week
    query_by = params[:query_by] || QUERY_BY_SCHEDULE
    course = params[:course]

    workshops = Pd::Workshop.in_state(::Pd::Workshop::STATE_ENDED)
    unless current_user.permission?(UserPermission::WORKSHOP_ADMIN)
      workshops = workshops.organized_by current_user
    end

    # optional '-' (meaning not) followed by a course name
    if course && (match = /^(-)?(.+)$/.match course)
      course_name = COURSE_MAP[match[2]]
      workshops =
        if match[1]
          workshops.where.not(course: course_name)
        else
          workshops.where(course: course_name)
        end
    end

    workshops =
      if query_by == QUERY_BY_END
        workshops.end_on_or_after(start_date).end_on_or_before(end_date)
      else # assume by schedule
        workshops.scheduled_start_on_or_after(start_date).scheduled_start_on_or_before(end_date)
      end

    workshops
  end

  # Apply filters to a set of workshops based on query params. All filters are optional:
  # - state
  # - start (first session on or after)
  # - end (first session on or before)
  # - course
  # - subject
  # - organizer_id
  # - teacher_email
  # - only_attended
  # - order_by (field followed by optional asc|desc)
  #   - location_name
  #   - on_map
  #   - funded
  #   - course
  #   - subject
  #   - date (scheduled start date)
  #   - enrollments (active enrollment count)
  #   - state
  # Most fields, if incorrect will simply yield an empty result set
  # However date and order fields are verified and an ArgumentError will be raised if they're invalid.
  # @param workshops [Pd::Workshop::ActiveRecord_Relation] workshop query to filter
  # raises [ArgumentError] when date or order params are invalid
  # returns [Pd::Workshop::ActiveRecord_Relation] filtered workshop query.
  # Note the filters won't actually be run in SQL until the results are examined.
  def filter_workshops(workshops)
    filter_params.tap do |params|
      workshops = workshops.in_state(params[:state], error_on_bad_state: false) if params[:state]
      workshops = workshops.scheduled_start_on_or_after(ensure_date(params[:start])) if params[:start]
      workshops = workshops.scheduled_start_on_or_before(ensure_date(params[:end])) if params[:end]
      workshops = workshops.where(course: params[:course]) if params[:course]
      workshops = workshops.where(subject: params[:subject]) if params[:subject]

      if current_user.permission?(UserPermission::WORKSHOP_ADMIN)
        workshops = workshops.where(organizer_id: params[:organizer_id]) if params[:organizer_id]
        workshops = workshops.facilitated_by(User.find_by(id: params[:facilitator_id])) if params[:facilitator_id]

        if params[:virtual]
          # Note this is an inefficient workaround required
          # because we store a workshop's virtual status as
          # a serialized attribute, which cannot be queried easily
          # via the typical ActiveRecord where method.
          virtual_status = params[:virtual] == 'yes'
          workshops_array = workshops.select {|workshop| workshop.virtual? == virtual_status}
          workshops = workshops_array.empty? ?
            workshops.none :
            workshops.where(id: workshops_array.map(&:id))
        end
      end

      if params[:regional_partner_id] && params[:regional_partner_id] != 'all'
        regional_partner_id = params[:regional_partner_id] == 'none' ? nil : params[:regional_partner_id]
        workshops = workshops.where(regional_partner_id: regional_partner_id)
      end

      if current_user.permission?(UserPermission::WORKSHOP_ADMIN) && params[:teacher_email]
        teacher = User.find_by(email: params[:teacher_email])
        workshops =
          if teacher
            if params[:only_attended]
              workshops.attended_by(teacher)
            else
              workshops.enrolled_in_by(teacher)
            end
          else
            workshops.none
          end
      end

      order_by = params[:order_by]
      if order_by
        parsed = order_by.downcase.match /^(\w+)(?: (asc|desc))?$/
        raise ArgumentError, "Unable to parse order_by param: #{order_by}" unless parsed
        field, direction = parsed[1..2]
        case field
          when 'location_name'
            workshops = workshops.order("location_name #{direction}".strip)
          when 'on_map'
            workshops = workshops.order("on_map #{direction}".strip)
          when 'funded'
            workshops = workshops.order("funded #{direction}".strip)
          when 'course'
            workshops = workshops.order("course #{direction}".strip)
          when 'subject'
            workshops = workshops.order("subject #{direction}".strip)
          when 'virtual'
            workshops = workshops.order("virtual #{direction}".strip)
          when 'date'
            workshops = workshops.order_by_scheduled_start(desc: direction == 'desc')
          when 'enrollments'
            workshops = workshops.order_by_enrollment_count(desc: direction == 'desc')
          when 'state'
            workshops = workshops.order_by_state(desc: direction == 'desc')
          else
            raise ArgumentError, "Invalid order_by field: #{field}"
        end
      end
    end

    workshops
  end

  # Permitted params used in #filter_workshops
  def filter_params
    params.permit(
      :state,
      :start,
      :end,
      :course,
      :subject,
      :virtual,
      :facilitator_id,
      :organizer_id,
      :teacher_email,
      :only_attended,
      :order_by,
      :regional_partner_id
    )
  end

  private

  # Verifies a date string is valid
  # param @date_str [String] the string to verify
  # raises [ArgumentError] if the date string is invalid
  # returns [String] the original value
  def ensure_date(date_str)
    # will raise ArgumentError if it's not a valid date string
    DateTime.parse(date_str) && date_str
  end
end
