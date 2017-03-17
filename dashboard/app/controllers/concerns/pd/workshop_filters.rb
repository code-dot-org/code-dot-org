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
    unless current_user.admin?
      workshops = workshops.organized_by current_user
    end

    # optional '-' (meaning not) followed by a course name
    if course && (match = /^(-)?(.+)$/.match course)
      course_name = COURSE_MAP[match[2]]
      if match[1]
        workshops = workshops.where.not(course: course_name)
      else
        workshops = workshops.where(course: course_name)
      end
    end

    if query_by == QUERY_BY_END
      workshops = workshops.end_on_or_after(start_date).end_on_or_before(end_date)
    else # assume by schedule
      workshops = workshops.start_on_or_after(start_date).start_on_or_before(end_date)
    end

    workshops
  end
end
