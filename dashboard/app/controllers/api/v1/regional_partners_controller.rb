require 'cdo/firehose'

class Api::V1::RegionalPartnersController < ApplicationController
  before_action :authenticate_user!, except: [:find, :show]

  include Pd::SharedWorkshopConstants
  include Pd::Application::ActiveApplicationModels

  # GET /api/v1/regional_partners
  def index
    regional_partners = (current_user.facilitator? || current_user.workshop_admin?) ? RegionalPartner.all : current_user.regional_partners

    render json: regional_partners.order(:name).map {|partner| {id: partner.id, name: partner.name}}
  end

  # GET /api/v1/regional_partners/capacity?role=:role&regional_partner_value=:regional_partner
  def capacity
    regional_partner_value = current_user.workshop_admin? ?
      params[:regional_partner_value] :
      current_user.regional_partners.first.try(:id)

    render json: {capacity: get_partner_cohort_capacity(regional_partner_value, params[:role])}
  end

  # GET /api/v1/regional_partners/enrolled?role=:role&regional_partner_value=:regional_partner
  def enrolled
    regional_partner_id =
      if current_user.workshop_admin?
        # 'none', 'all', nil will become 0
        params[:regional_partner_value].to_i
      else
        current_user.regional_partners.first.try(:id)
      end

    render json: {enrolled: get_partner_enrollment_count(regional_partner_id, params[:role])}
  end

  # GET /api/v1/regional_partners/show/:id
  def show
    partner_id = params[:partner_id]
    partner = RegionalPartner.find_by_id(partner_id)

    if partner
      render json: partner, serializer: Api::V1::Pd::RegionalPartnerSerializer
    else
      render json: {error: WORKSHOP_SEARCH_ERRORS[:no_partner]}
    end
  end

  # GET /api/v1/regional_partners/find
  def find
    zip_code = params[:zip_code]

    partner, state = RegionalPartner.find_by_zip(zip_code)

    result = nil

    if partner
      render json: partner, serializer: Api::V1::Pd::RegionalPartnerSerializer
      result = 'partner-found'
    elsif state
      render json: {error: WORKSHOP_SEARCH_ERRORS[:no_partner]}
      result = 'no-partner'
    else
      render json: {error: WORKSHOP_SEARCH_ERRORS[:no_state]}
      result = 'no-state'
    end

    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'regional-partner-search-log',
        event: result,
        data_string: zip_code,
        source_page_id: params[:source_page_id]
      }
    )
  end

  private

  # Get the regional partner's cohort capacity for a specific role
  # @param role (ex: 'csd_teachers' or 'csf_facilitators')
  # @param regional_partner_value is 'none', 'all', or a regional partner's id
  # @return the partner's capacity for that role if an id is given, otherwise nil
  def get_partner_cohort_capacity(regional_partner_value, role)
    unless ['none', 'all'].include? regional_partner_value
      partner_id = regional_partner_value ? regional_partner_value : current_user.regional_partners.first
      regional_partner = RegionalPartner.find_by(id: partner_id)
      if role == 'csd_teachers'
        return regional_partner&.cohort_capacity_csd
      elsif role == 'csp_teachers'
        return regional_partner&.cohort_capacity_csp
      end
    end
    nil
  end

  # Get the regional partner's number of enrollments to current-year role-specific workshops.
  #
  # @param regional_partner_id [Integer]
  # @param role [String] a string contains workshop course and subject type, e.g. 'csp_teachers'
  # @return [Integer, nil] nil if regional_partner_id is invalid, otherwise returns a count
  # @see Api::V1::Pd::ApplicationsController:ROLES
  #
  def get_partner_enrollment_count(regional_partner_id, role)
    partner = RegionalPartner.find_by_id(regional_partner_id)
    return unless partner

    workshops = partner.pd_workshops
    workshops_by_role =
      case role.to_sym
      when :csf_facilitators
        workshops.where(course: COURSE_CSF, subject: SUBJECT_CSF_FIT)
      when :csd_facilitators
        workshops.where(course: COURSE_CSD, subject: SUBJECT_CSD_FIT)
      when :csp_facilitators
        workshops.where(course: COURSE_CSP, subject: SUBJECT_CSP_FIT)
      when :csd_teachers
        workshops.where(course: COURSE_CSD).where.not(subject: SUBJECT_CSD_FIT)
      when :csp_teachers
        workshops.where(course: COURSE_CSP).where.not(subject: SUBJECT_CSP_FIT)
      else
        # Should never get here. This value will cause an exception on the next calculation,
        # which expects an ActiveRecord::Relation.
        nil
      end

    workshop_current_year_ids =
      workshops_by_role.select {|ws| ws.school_year == APPLICATION_CURRENT_YEAR}.pluck(:id)

    Pd::Enrollment.where(pd_workshop_id: [workshop_current_year_ids]).count
  end
end
