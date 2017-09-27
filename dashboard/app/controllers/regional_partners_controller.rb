class RegionalPartnersController < ApplicationController
  authorize_resource class: :pd_regional_partner_management
  before_action :set_regional_partner, only: [:show, :edit, :update]

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
    @regional_partner = RegionalPartner.new
  end

  # POST /regional_partners
  def create
    @regional_partner = RegionalPartner.new(regional_partner_params)
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

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_regional_partner
    @regional_partner = RegionalPartner.find(params[:id])
  end

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
end
