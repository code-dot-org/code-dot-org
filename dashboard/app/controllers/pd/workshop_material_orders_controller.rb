class Pd::WorkshopMaterialOrdersController < ApplicationController
  load_and_authorize_resource :enrollment, class: 'Pd::Enrollment', find_by: 'code',
    id_param: :enrollment_code

  load_and_authorize_resource :workshop_material_order, class: 'Pd::WorkshopMaterialOrder',
    through: :enrollment, parent: false, singleton: true, except: :admin_index

  load_and_authorize_resource :workshop_material_order, class: 'Pd::WorkshopMaterialOrder',
    parent: false, only: :admin_index, collection: :admin_index

  # GET /pd/workshop_materials/:enrollment_code
  def new
    if !@enrollment.completed_survey? || @enrollment.workshop.course != Pd::Workshop::COURSE_CSF
      redirect_to CDO.code_org_url("/pd-workshop-survey/#{@enrollment.code}", CDO.default_scheme)
    elsif @enrollment.workshop_material_order
      render :thanks
    end
  end

  # POST /pd/workshop_materials/:enrollment_code
  def create
    @workshop_material_order.place_order if @workshop_material_order.valid?

    if @workshop_material_order.save
      render :thanks
    else
      render :new
    end
  end

  # GET /pd/workshop_materials
  def admin_index
    @workshop_material_orders = Pd::WorkshopMaterialOrder.order(created_at: :desc)
    @counts = {
      total: @workshop_material_orders.count,
      succesfully_ordered: @workshop_material_orders.successfully_ordered.count,
      shipped: @workshop_material_orders.shipped.count,
      order_errors: @workshop_material_orders.with_order_errors.count
    }
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
