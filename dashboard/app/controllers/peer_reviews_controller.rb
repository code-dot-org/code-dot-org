class PeerReviewsController < ApplicationController
  load_and_authorize_resource except: [:pull_review, :dashboard]
  authorize_resource class: :peer_reviews, only: :dashboard

  def index
    @available = @peer_reviews.where(reviewer: nil)
    @submitted = @peer_reviews.where(reviewer: current_user)
  end

  def show
    @level = @peer_review.level
    @user = @peer_review.submitter
    @last_attempt = @peer_review.level_source.data
    view_options(full_width: true)
  end

  def dashboard
    courses = Plc::Course.all.select {|course| course.plc_course_units.map(&:script).any?(&:peer_reviews_to_complete?)}

    @course_list = courses.map {|course| [course.name, course.id]}

    @course_unit_map = {}.tap do |course_unit_map|
      courses.each do |course|
        course_unit_map[course.id] = course.plc_course_units.map {|course_unit| [course_unit.name, course_unit.id]}
      end
    end
  end

  def pull_review
    script = Script.get_from_cache(params[:script_id])

    # If the user is not enrolled in this script, don't let them pull a review
    unless Plc::EnrollmentUnitAssignment.exists?(user: current_user, plc_course_unit: script.plc_course_unit)
      flash[:notice] = t('peer_review.must_be_enrolled')
      redirect_to script_path(script)
      return
    end

    peer_review = PeerReview.pull_review_from_pool(script, current_user)

    if peer_review
      redirect_to peer_review_path(peer_review)
    else
      flash[:notice] = t('peer_review.no_reviews_at_this_moment_notice')
      redirect_to script_path(script)
    end
  end

  def update
    @peer_review.update! peer_review_params.merge(
      reviewer: current_user,
      from_instructor: current_user.plc_reviewer?
    )

    flash[:notice] = t('peer_review.review_submitted')

    if current_user.permission?('plc_reviewer')
      redirect_to peer_reviews_dashboard_path
    else
      redirect_to script_path(@peer_review.script)
    end
  end

  private

  def peer_review_params
    return_params = params.require(:peer_review).permit(:data, :status)

    if return_params[:data]
      return_params[:data] = return_params[:data].strip_utf8mb4
    end

    # Only plc reviewers should be able to set the status on a review
    unless current_user.permission? UserPermission::PLC_REVIEWER
      return_params.delete :status
    end

    return_params
  end
end
