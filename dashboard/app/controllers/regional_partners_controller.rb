class RegionalPartnersController < ApplicationController
  load_and_authorize_resource

  # restrict the PII returned by the controller to the view by selecting only these columns from the model
  RESTRICTED_USER_ATTRIBUTES_FOR_VIEW = %w(
    id
    email
    name
    user_type
    current_sign_in_at
    sign_in_count
    users.created_at
    provider
  ).freeze

  # GET /regional_partners
  def index
    search_term = params[:search_term]
    if search_term =~ /^\d+$/
      @regional_partners = RegionalPartner.where(id: search_term)
    elsif search_term
      @regional_partners = RegionalPartner.where("name LIKE :partial_name", {partial_name: "%#{search_term}%"})
    end

    unless @regional_partners.try(:any?) || search_term.blank?
      flash[:notice] = "No matching Regional Partners found. Showing all."
    end
    # display all regional partners if search does not return any results
    @regional_partners = RegionalPartner.all unless @regional_partners.try(:any?)
  end

  # GET /regional_partners/:id
  def show
  end

  # GET /regional_partners/new
  def new
  end

  # POST /regional_partners
  def create
    if @regional_partner.save
      flash[:notice] = "Regional Partner created successfully"
      redirect_to @regional_partner
    else
      render 'new'
    end
  end

  # GET /regional_partners/:id/edit
  def edit
  end

  # PATCH /regional_partners/:id
  def update
    update_params = regional_partner_params.to_h
    %w(csd csp).each do |course|
      %w(teacher facilitator).each do |role|
        %w(open close).each do |state|
          key = "apps_#{state}_date_#{course}_#{role}".to_sym

          # Do a date validation.  An exception will result if invalid.
          Date.parse(regional_partner_params[key]) if regional_partner_params[key].presence
        end
      end
    end

    # Do a date validation.  An exception will result if invalid.
    Date.parse(regional_partner_params[:apps_priority_deadline_date]) if regional_partner_params[:apps_priority_deadline_date].presence

    if @regional_partner.update(update_params)
      flash[:notice] = "Regional Partner updated successfully"
      redirect_to @regional_partner
    else
      render action: 'edit'
    end
  end

  # POST /regional_partners/:id/assign_program_manager
  def assign_program_manager
    email = params[:email]
    user = restricted_users.find_by(user_type: 'teacher', hashed_email: User.hash_email(email))
    if user
      @regional_partner.program_manager = user.id
    else
      flash[:notice] = "No teacher with email <#{email}> found. Program Manager not assigned to Regional Partner."
    end
    redirect_to @regional_partner
  end

  # GET /regional_partners/:id/remove_program_manager
  def remove_program_manager
    @regional_partner.program_managers.destroy(params[:program_manager_id])
    redirect_to @regional_partner
  end

  # POST /regional_partners/:id/add_mapping
  def add_mapping
    region = params[:region]
    state = region if region.present? && region.in?(STATE_ABBR_WITH_DC_HASH.keys.map(&:to_s))
    zip_code = region if region.present? && RegexpUtils.us_zip_code?(region)
    result = @regional_partner.mappings.find_or_create_by(state: state, zip_code: zip_code)
    if !result.errors[:base].nil_or_empty?
      flash[:alert] = "Failed to add #{region}. #{result.errors[:base].join(',')}."
    else
      flash[:notice] = "Successfully added #{region}."
    end
    redirect_to @regional_partner
  end

  # GET /regional_partners/:id/remove_mapping
  def remove_mapping
    @regional_partner.mappings.delete(params[:mapping_id])
    redirect_to @regional_partner
  end

  # POST /regional_partners/:id/replace_mappings
  def replace_mappings
    regions_file = params[:regions]
    csv = validate_csv_file(regions_file)
    unless csv
      redirect_to @regional_partner
      return
    end

    mappings = []
    errors = []
    parse_regions(csv, mappings, errors)

    if !errors.empty?
      flash[:upload_error] = parse_upload_errors(errors)
      redirect_to @regional_partner
    else
      @regional_partner.mappings.clear
      @regional_partner.mappings = mappings
      flash[:notice] = "Successfully replaced mappings"
      redirect_to @regional_partner
    end
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def regional_partner_params
    permitted_params = %i(
      name
      group
      urban
      cohort_capacity_csd
      cohort_capacity_csp
      apps_open_date_csd_teacher
      apps_open_date_csd_facilitator
      apps_open_date_csp_teacher
      apps_open_date_csp_facilitator
      apps_close_date_csd_teacher
      apps_close_date_csd_facilitator
      apps_close_date_csp_teacher
      apps_close_date_csp_facilitator
      apps_priority_deadline_date
      applications_principal_approval
      applications_decision_emails
      link_to_partner_application
      csd_cost
      csp_cost
      cost_scholarship_information
      additional_program_information
      contact_name
      contact_email
      attention
      street
      apartment_or_suite
      city
      state
      zip_code
      phone_number
      notes
    )
    params.require(:regional_partner).permit(permitted_params)
  end

  def restricted_users
    User.select(RESTRICTED_USER_ATTRIBUTES_FOR_VIEW)
  end

  def validate_csv_file(file)
    unless file
      flash[:alert] = "Replace mappings failed. CSV file not found."
      return false
    end
    begin
      csv = CSV.read(file.path, headers: true, liberal_parsing: true)
      unless csv.headers.include?("Region")
        flash[:alert] = "Replace mappings failed. CSV does not include 'Region' header."
        return false
      end
      return csv
    rescue
      flash[:alert] = "Replace mappings failed. Could not read file."
      return false
    end
  end

  def parse_regions(csv, mappings, errors)
    regions_missing = false
    csv.each do |row|
      region = row['Region']
      unless region.present?
        regions_missing = true
        next
      end
      state = region if region.present? && region.in?(STATE_ABBR_WITH_DC_HASH.keys.map(&:to_s))
      zip_code = region if region.present? && RegexpUtils.us_zip_code?(region)
      if !state && !zip_code
        errors << {region: region, message: "Invalid region"}
        next
      end
      mapping = @regional_partner.mappings.build({state: state, zip_code: zip_code})
      mapping.valid?
      if !mapping.errors[:base].nil_or_empty?
        errors << {region: region, message: mapping.errors[:base].join(',')}
      else
        mappings << mapping
      end
    end
    if regions_missing
      errors << {region: nil, message: "At least one line is missing a region"}
    end
  end

  def parse_upload_errors(errors)
    error_message = "<b>Replace mappings failed. Please fix the following error(s):</b>"
    errors.each do |error|
      error_message += "<br>"
      if error[:region]
        error_message += "#{error[:region]}: "
      end
      error_message += error[:message]
    end
    return error_message
  end
end
