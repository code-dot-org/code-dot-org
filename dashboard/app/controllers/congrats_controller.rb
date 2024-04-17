class CongratsController < ApplicationController
  include CertificatesHelper

  def index
    view_options(full_width: true, responsive_content: true, has_i18n: true)

    # Select two different donors, because the first must have a twitter
    # handle and the second must be equally weighted across all donors.
    @random_donor_twitter = DashboardCdoDonor.get_random_donor_twitter
    @random_donor_name = DashboardCdoDonor.get_random_donor_name
    begin
      @course_name = params[:s] && Base64.urlsafe_decode64(params[:s])
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    @course_name = 'hourofcode' if @course_name.blank?
    curriculum = CurriculumHelper.find_matching_unit_or_unit_group(@course_name)

    if curriculum.is_a?(UnitGroup)
      @curriculum_url = course_path(curriculum)
      units = curriculum.units_for_user(current_user)
      completed_units = units.filter {|unit| Policies::ScriptActivity.completed?(current_user, unit)}
      @certificate_data =
        if completed_units.length == units.length
          [{
            courseName: @course_name,
            courseTitle: curriculum.localized_title,
            coursePath: course_path(curriculum),
          }]
        else
          completed_units.map do |unit|
            {
              courseName: unit.name,
              courseTitle: unit.localized_title,
              coursePath: script_path(unit),
            }
          end
        end
    elsif curriculum.nil?
      # This occurs when the user completes a third party tutorial
      @curriculum_url = script_path('hourofcode')
      @certificate_data = [{
        courseName: @course_name,
        courseTitle: I18n.t('certificates.one_hour_of_code'),
        coursePath: @curriculum_url,
      }]
    else
      @curriculum_url = script_path(curriculum)
      # The order of this conditional is important. During HoC, we generally want to avoid
      # hitting the database, so we check if the unit is an HoC unit first.
      @certificate_data =
        if Policies::ScriptActivity.can_view_congrats_page?(current_user, curriculum)
          [{
            courseName: @course_name,
            courseTitle: curriculum.localized_title,
            coursePath: @curriculum_url,
          }]
        else
          []
        end
    end

    course_type = CertificateImage.course_type(@course_name)
    @is_hoc_tutorial = course_type == 'hoc'
    @is_pl_course = course_type == 'pl'
    if @is_pl_course
      course_version = CurriculumHelper.find_matching_course_version(@course_name)
      @is_k5_pl_course = course_version&.course_offering&.pl_for_elementary_school?
      if current_user.teacher?
        @sections = current_user.sections.all.reject(&:hidden).map(&:summarize)
      end
      @assignable_course_suggestions =
        CourseOffering.assignable_published_for_students_course_offerings.
          select {|co| co.self_paced_pl_course_offering_id == curriculum.get_course_version&.course_offering_id}.
          map(&:summarize_for_catalog)
    end
    @next_course_script_name = ScriptConstants.csf_next_course_recommendation(@course_name)
    next_script = Unit.get_from_cache(@next_course_script_name) if @next_course_script_name
    @next_course_title = next_script.localized_title if next_script
    @next_course_description = next_script.localized_description if next_script
  end
end
