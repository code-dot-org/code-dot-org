require 'base64'

class CertificatesController < ApplicationController
  include CertificatesHelper

  before_action :authenticate_user!, only: [:batch]

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

    @certificate_data = {
      imageUrl: certificate_image_url(data['name'], data['course'], data['donor']),
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
    unless current_user.teacher?
      return redirect_to root_path, alert: 'You must be signed in as a teacher to bulk print certificates.'
    end

    begin
      course_name = params[:course] ? Base64.urlsafe_decode64(params[:course]) : 'hourofcode'
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    unless CurriculumHelper.find_matching_course_version(course_name)
      return render status: :bad_request, json: {message: 'invalid course name'}
    end

    student_names = request.method == 'POST' ? params[:names] : []

    @certificate_data = {
      courseName: course_name,
      studentNames: student_names,
      imageUrl: certificate_image_url(nil, course_name, nil),
    }
  end
end
