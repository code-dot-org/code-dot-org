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
    button_factory = PageButtonFactory.new(self, base_params)
    page_buttons = [
      button_factory.new_page_button('<<', page: 1, disabled: collection.first_page?),
      button_factory.new_page_button('<', page: current_page - 1, disabled: collection.first_page?),
      button_factory.new_page_button('>', page: current_page + 1, disabled: collection.last_page?),
      button_factory.new_page_button('>>', page: collection.total_pages, disabled: collection.last_page?)
    ]

    page_size = params[:page_size] || collection.limit_value
    page_size_buttons = %w(25 50 All).map do |page_size_option|
      button_factory.new_page_size_button page_size_option
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

  class PageButtonFactory
    def initialize(context, base_params)
      @context = context
      @base_params = base_params
    end

    def new_page_button(text, page:, disabled: false)
      @context.link_to text, @base_params.merge(page: page), class: btn_class(disabled: disabled)
    end

    def new_page_size_button(page_size)
      @context.link_to page_size, @base_params.merge(page_size: page_size)
    end

    private

    def btn_class(disabled: false)
      'btn btn-default' + (disabled ? ' disabled' : '')
    end
  end
end
