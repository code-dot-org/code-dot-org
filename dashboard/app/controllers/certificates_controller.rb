require 'base64'

class CertificatesController < ApplicationController
  include CertificatesHelper

  # GET /certificates/:encoded_params
  # encoded_params includes:
  #   name - student name (optional)
  #   course - course name (optional)
  #   donor - donor name (optional)
  def show
    view_options(full_width: true, responsive_content: true)

    begin
      data = JSON.parse(Base64.urlsafe_decode64(params[:encoded_params]))
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    announcement = Announcements.get_announcement_for_page('/certificates')

    @image_url = certificate_image_url(data['name'], data['course'], data['donor'])
    course_name = CurriculumHelper.find_matching_unit_or_unit_group(data['course'])&.localized_title || I18n.t('certificates.one_hour_of_code')
    image_alt = data['name'] ?
      I18n.t('certificates.alt_text_with_name', course_name: course_name, student_name: data['name']) :
      I18n.t('certificates.alt_text_no_name', course_name: course_name)
    # The alt text string is a good page title, so re-using it here.
    @page_title = I18n.t('certificates.alt_text_no_name', course_name: course_name)

    @certificate_data = {
      imageUrl: @image_url,
      imageAlt: image_alt,
      printUrl: certificate_print_url(data['name'], data['course'], data['donor']),
      announcement: announcement
    }
  end

  def blank
    announcement = Announcements.get_announcement_for_page('/certificates')

    @certificate_data = {
      imageUrl: certificate_image_url(nil, 'hourofcode', nil),
      printUrl: certificate_print_url(nil, 'hourofcode', nil),
      announcement: announcement
    }

    render :show
  end

  # GET /certificates/batch
  # POST /certificates/batch
  def batch
    if current_user&.student?
      return redirect_to root_path, alert: 'You must be signed in as a teacher to bulk print certificates.'
    end

    begin
      course_name = params[:course] ? Base64.urlsafe_decode64(params[:course]) : 'hourofcode'
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    course_version = CurriculumHelper.find_matching_course_version(course_name)
    return render status: :bad_request, json: {message: "invalid course name: #{course_name.inspect}"} unless course_version

    course_title = course_name == 'hourofcode' ? I18n.t('certificate_hour_of_code') : course_version.localized_title

    student_names = request.method == 'POST' ? params[:names] : []

    @certificate_data = {
      courseName: course_name,
      courseTitle: course_title,
      studentNames: student_names,
      imageUrl: certificate_image_url(nil, course_name, nil),
    }
  end
end
