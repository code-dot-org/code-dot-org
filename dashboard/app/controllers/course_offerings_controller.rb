class CourseOfferingsController < ApplicationController
  load_and_authorize_resource except: [:quick_assign_course_offerings]

  before_action :require_levelbuilder_mode, except: [:quick_assign_course_offerings]
  before_action :authenticate_user!

  def edit
    @course_offering = CourseOffering.find_by!(key: params[:key])
    render :not_found unless @course_offering
  end

  def update
    @course_offering = CourseOffering.find_by!(key: params[:key])
    @course_offering.update!(course_offering_params)

    if Rails.application.config.levelbuilder_mode
      @course_offering.write_serialization
    end

    render json: @course_offering.summarize_for_edit
  rescue ActiveRecord::RecordNotFound, ActiveRecord::RecordInvalid => e
    render(status: :not_acceptable, plain: e.message)
  end

  def quick_assign_course_offerings
    return head :forbidden unless current_user

    offerings = {}

    assignable_offerings = CourseOffering.assignable_course_offerings(current_user)
    assignable_elementary_offerings = assignable_offerings.filter(&:elementary_school_level?)
    assignable_middle_offerings = assignable_offerings.filter(&:middle_school_level?)
    assignable_high_offerings = assignable_offerings.filter(&:high_school_level?)

    offerings[:elementary] = group_offerings_for_quick_assign(assignable_elementary_offerings)
    offerings[:middle] = group_offerings_for_quick_assign(assignable_middle_offerings)
    offerings[:high] = group_offerings_for_quick_assign(assignable_high_offerings)

    render :ok, json: offerings.to_json
  end

  private

  def course_offering_params
    params.permit(:display_name, :is_featured, :category, :assignable, :grade_levels, :curriculum_type, :header, :marketing_initiative).to_h
  end

  def group_offerings_for_quick_assign(course_offerings)
    data = {}
    course_offerings.each do |co|
      next if co.header.blank? || co.curriculum_type.blank?

      data[co.curriculum_type] ||= {}
      data[co.curriculum_type][co.header] ||= []
      data[co.curriculum_type][co.header].append(co.summarize_for_quick_assign(current_user, request.locale))
    end

    data.keys.each do |curriculum_type|
      data[curriculum_type].keys.each do |header|
        data[curriculum_type][header].sort_by! {|co| co[:display_name]}
      end
      data[curriculum_type] = data[curriculum_type].sort.to_h
    end

    data
  end
end
