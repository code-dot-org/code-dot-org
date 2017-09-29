class Pd::WorkshopMaterialOrdersController < ApplicationController
  include Pd::PageHelper

  DEFAULT_PAGE_SIZE = 25

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

    # Search emails
    @workshop_material_orders = @workshop_material_orders.search_emails(params[:email]) if params[:email]

    # filter: [ordered | shipped | errors]
    if params[:filter]
      case params[:filter].try(:downcase)
        when 'ordered'
          @workshop_material_orders = @workshop_material_orders.successfully_ordered
        when 'shipped'
          @workshop_material_orders = @workshop_material_orders.shipped
        when 'errors'
          @workshop_material_orders = @workshop_material_orders.with_order_errors
        else
          params.delete :filter
      end
    end

    @workshop_material_orders = @workshop_material_orders.page(page).per(page_size)
    view_options(full_width: true)
  end

  private

  def workshop_material_order_params
    params.require(:pd_workshop_material_order).permit(
      :school_or_company,
      :street,
      :apartment_or_suite,
      :city,
      :state,
      :zip_code,
      :phone_number,
      :address_override
    )
  end

  def page
    params[:page] || 1
  end

  def page_size
    return DEFAULT_PAGE_SIZE unless params.key? :page_size
    params[:page_size] == 'All' ? @workshop_material_orders.count : params[:page_size]
  end
end
