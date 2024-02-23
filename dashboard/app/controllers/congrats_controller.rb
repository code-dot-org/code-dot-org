class CongratsController < ApplicationController
  include CertificatesHelper

  def index
    view_options(full_width: true, responsive_content: true, has_i18n: true)

    # Select two different donors, because the first must have a twitter
    # handle and the second must be equally weighted across all donors.
    @random_donor_twitter = DashboardCdoDonor.get_random_donor_twitter
    @random_donor_name = DashboardCdoDonor.get_random_donor_name
    begin
      course_name = params[:s] && Base64.urlsafe_decode64(params[:s])
      unit_group = UnitGroup.get_from_cache(course_name)
      if unit_group
        units = unit_group.units_for_user(current_user)
        completed_units = UserScript.where(user: current_user, script: units).where.not(completed_at: nil).map(&:script)
        @certificate_image_urls =
          if completed_units.empty? || completed_units.length == units.length
            [certificate_image_url(nil, course_name, nil)]
          else
            completed_units.map {|unit| certificate_image_url(nil, unit.name, nil)}
          end
        @certificate_data =
          if completed_units.empty? || completed_units.length == units.length
            [{
              courseName: course_name
            }]
          else
            completed_units.map do |unit|
              {
                courseName: unit.name
              }
            end
          end

      else
        @certificate_image_urls = [certificate_image_url(nil, course_name, nil)]
        @certificate_data = [{
          courseName: course_name
        }]
      end
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    course_type = CertificateImage.course_type(@course_name)
    @is_hoc_tutorial = course_type == 'hoc'
    @is_pl_course = course_type == 'pl'
    if @is_pl_course
      course_version = CurriculumHelper.find_matching_course_version(@course_name)
      @is_k5_pl_course = course_version&.course_offering&.pl_for_elementary_school?
    end
    @next_course_script_name = ScriptConstants.csf_next_course_recommendation(@course_name)
    next_script = Unit.get_from_cache(@next_course_script_name) if @next_course_script_name
    @next_course_title = next_script.localized_title if next_script
    @next_course_description = next_script.localized_description if next_script
  end
end
