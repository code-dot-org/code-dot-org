# Mirrors CongratsController#index's entitlement computation for the
# congrats API. Deliberately a line-for-line copy rather than a shared
# helper: CongratsController#index stays untouched while the
# client_side_certificates flag exists, and this duplication is retired
# along with it.
class Api::V1::CongratsSerializer
  include Rails.application.routes.url_helpers

  def initialize(current_user, course_name)
    @current_user = current_user
    @course_name = course_name.presence || 'hourofcode'
  end

  def as_json(*)
    {
      certificates: certificates,
      isHocTutorial: hoc_tutorial?,
      isPlCourse: pl_course?,
      isK5PlCourse: k5_pl_course?,
      sections: sections,
      assignableCourseSuggestions: assignable_course_suggestions,
      nextCourseScriptName: next_course_script_name,
      nextCourseTitle: next_script&.localized_title,
      nextCourseDescription: next_script&.localized_description,
      userName: @current_user&.name,
      under13: @current_user&.under_13? || false,
      userType: @current_user&.user_type,
    }
  end

  private def curriculum
    @curriculum ||= CurriculumHelper.find_matching_unit_or_unit_group(@course_name)
  end

  private def certificates
    return @certificates if defined?(@certificates)

    @certificates =
      if curriculum.is_a?(UnitGroup)
        units = curriculum.units_for_user(@current_user)
        if curriculum.single_unit_course?
          if Policies::ScriptActivity.can_view_congrats_page?(@current_user, units.first)
            [{courseName: @course_name, courseTitle: curriculum.localized_title, coursePath: course_path(curriculum)}]
          else
            []
          end
        else
          completed_units = units.filter {|unit| Policies::ScriptActivity.completed?(@current_user, unit)}
          if completed_units.length == units.length
            [{courseName: @course_name, courseTitle: curriculum.localized_title, coursePath: course_path(curriculum)}]
          else
            completed_units.map do |unit|
              {courseName: unit.name, courseTitle: unit.localized_title, coursePath: script_path(unit)}
            end
          end
        end
      elsif curriculum.nil?
        # This occurs when the user completes a third party tutorial
        [{courseName: @course_name, courseTitle: I18n.t('certificates.one_hour_of_code'), coursePath: script_path('hourofcode')}]
      else
        # The order of this conditional is important. During HoC, we generally want to avoid
        # hitting the database, so we check if the unit is an HoC unit first.
        if Policies::ScriptActivity.can_view_congrats_page?(@current_user, curriculum)
          [{courseName: @course_name, courseTitle: curriculum.localized_title, coursePath: script_path(curriculum)}]
        else
          []
        end
      end
  end

  private def course_type
    @course_type ||= CertificateImage.course_type(@course_name)
  end

  private def hoc_tutorial?
    course_type == 'hoc'
  end

  private def pl_course?
    course_type == 'pl'
  end

  private def k5_pl_course?
    return false unless pl_course?
    course_version = CurriculumHelper.find_matching_course_version(@course_name)
    course_version&.course_offering&.pl_for_elementary_school? || false
  end

  private def sections
    return unless pl_course? && @current_user&.teacher?
    @current_user.sections.all.reject(&:hidden).map(&:summarize)
  end

  private def assignable_course_suggestions
    return unless pl_course?
    CourseOffering.assignable_published_for_students_course_offerings.
      select {|co| co.self_paced_pl_course_offering_id == curriculum.get_course_version&.course_offering_id}.
      map(&:summarize_for_catalog)
  end

  private def next_course_script_name
    @next_course_script_name ||= ScriptConstants.csf_next_course_recommendation(@course_name)
  end

  private def next_script
    return @next_script if defined?(@next_script)
    @next_script = next_course_script_name ? Unit.get_from_cache(next_course_script_name) : nil
  end
end
