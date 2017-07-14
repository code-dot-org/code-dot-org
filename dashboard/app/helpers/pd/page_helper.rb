# Helper for simple paging controls
module Pd::PageHelper
  # Renders a page header with paging buttons and a page size drop down.
  # Each page button is a link to the same controller action with the appropriate page: param,
  # and existing values of permitted_params.
  # Each page_size button is similar, but with page_size: set.
  # @param collection_name [String] Name to be displayed in the page header, e.g. "Applications"
  # @param collection [ActiveRecord::Relation] collection of models with paging applied
  # @param permitted_params [Array<String, Symbol>] params to be preserved in paging urls
  def page_header(collection_name, collection, permitted_params: [])
    current_page = collection.current_page

    base_params = params.permit(permitted_params + [:page_size])
    page_buttons = [
      new_page_button('<<', base_params.merge(page: 1), disabled: collection.first_page?),
      new_page_button('<', base_params.merge(page: current_page - 1), disabled: collection.first_page?),
      new_page_button('>', base_params.merge(page: current_page + 1), disabled: collection.last_page?),
      new_page_button('>>', base_params.merge(page: collection.total_pages), disabled: collection.last_page?)
    ]

    page_size = params[:page_size] || collection.limit_value
    page_size_buttons = %w(25 50 All).map do |page_size_option|
      new_page_size_button page_size_option, base_params
    end

    locals = {
      collection: collection,
      collection_name: collection_name,
      page_buttons: page_buttons,
      page_size: page_size,
      page_size_buttons: page_size_buttons
    }

    render partial: 'pd/page_header', locals: locals
  end

  def new_page_button(text, params, disabled: false)
    link_to text, params, class: btn_class(disabled: disabled)
  end

  def new_page_size_button(page_size, base_params)
    link_to page_size, base_params.merge(page_size: page_size)
  end

  def btn_class(disabled: false)
    "btn btn-default#{(disabled && ' disabled').presence}"
  end
end
