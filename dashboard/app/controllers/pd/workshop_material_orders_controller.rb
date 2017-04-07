require 'state_abbr'
class Pd::WorkshopMaterialOrdersController < ApplicationController
  load_and_authorize_resource :enrollment, class: 'Pd::Enrollment', find_by: 'code', id_param: :enrollment_code

  # GET /pd/workshop_materials/:enrollment_code
  def new
    if !@enrollment.completed_survey? || @enrollment.workshop.course != Pd::Workshop::COURSE_CSF
      redirect_to CDO.code_org_url("/pd-workshop-survey/#{@enrollment.code}", CDO.default_scheme)
      return
    elsif @enrollment.workshop_material_order
      render :thanks
      return
    end

    @workshop_materials_order = Pd::WorkshopMaterialOrder.new
  end

  # POST /pd/workshop_materials/:enrollment_code
  def create
    @workshop_materials_order = Pd::WorkshopMaterialOrder.new workshop_material_order_params
    @workshop_materials_order.assign_attributes(enrollment: @enrollment, user: current_user)

    if @workshop_materials_order.save
      @workshop_materials_order.place_order
      render :thanks
    else
      render :new
    end
  end

  # GET /pd/workshop_materials
  def admin_index
    require_admin

    @workshop_material_orders = Pd::WorkshopMaterialOrder.order(created_at: :desc).all
    @workshop_material_orders.each(&:refresh)
  end

  def workshop_material_order_params
    params.require(:pd_workshop_material_order).permit(
      :school_or_company,
      :street,
      :apartment_or_suite,
      :city,
      :state,
      :zip_code,
      :phone_number
    )
  end
end
