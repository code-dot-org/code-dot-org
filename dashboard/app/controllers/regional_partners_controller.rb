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
    if @regional_partner.update(regional_partner_params)
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
    @regional_partner.mappings.find_or_create_by(state: state, zip_code: zip_code)
    redirect_to @regional_partner
  end

  # GET /regional_partners/:id/remove_mapping
  def remove_mapping
    @regional_partner.mappings.delete(params[:mapping_id])
    redirect_to @regional_partner
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def regional_partner_params
    permitted_params = %i(
      name
      group
      urban
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
end
