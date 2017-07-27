require 'test_helper'

class Pd::PageHelperTest < ActionView::TestCase
  include Pd::PageHelper

  test 'btn_class default' do
    assert_equal 'btn btn-default', btn_class
  end

  test 'btn_class disabled' do
    assert_equal 'btn btn-default disabled', btn_class(disabled: true)
  end

  test 'new_page_button' do
    expects(:link_to).with('<', {page: 1}, class: 'btn btn-default')
    new_page_button '<', page: 1
  end

  test 'new_page_size_button' do
    expects(:link_to).with(50, {key: 'value', page_size: 50})
    new_page_size_button 50, {key: 'value'}
  end

  test 'page_header first page' do
    assert_page_header(
      {
        current_page: 1,
        first_page?: true,
        last_page?: false,
        total_pages: 10,
        limit_value: 25
      },
      [
        {text: '<<', page: 1, disabled: true},
        {text: '<', page: 0, disabled: true},
        {text: '>', page: 2, disabled: false},
        {text: '>>', page: 10, disabled: false}
      ]
    )
  end

  test 'page_header middle page' do
    assert_page_header(
      {
        current_page: 5,
        first_page?: false,
        last_page?: false,
        total_pages: 10,
        limit_value: 25
      },
      [
        {text: '<<', page: 1, disabled: false},
        {text: '<', page: 4, disabled: false},
        {text: '>', page: 6, disabled: false},
        {text: '>>', page: 10, disabled: false}
      ]
    )
  end

  test 'page_header last page' do
    assert_page_header(
      {
        current_page: 10,
        first_page?: false,
        last_page?: true,
        total_pages: 10,
        limit_value: 25
      },
      [
        {text: '<<', page: 1, disabled: false},
        {text: '<', page: 9, disabled: false},
        {text: '>', page: 11, disabled: true},
        {text: '>>', page: 10, disabled: true}
      ]
    )
  end

  private

  # Sets up expectations for, and then calls, page_header
  # @param collection_params [Hash] param hash for mock collection class
  #   Expected keys are [:current_page, :first_page?, :last_page?, :total_pages, :limit_value]
  # @param page_button_params [Array<Hash>] An array of hashes, each with keys
  #   [:text, :page, :disabled] representing expected params to the new_page_button method
  def assert_page_header(collection_params, page_button_params)
    collection = OpenStruct.new(collection_params)
    page_buttons = set_page_button_expectations page_button_params

    mock_params = mock
    stubs(:params).returns(mock_params)
    mock_params.expects(:permit).with([:allow, :page_size]).returns({})
    mock_params.expects(:[], :page_size).returns(nil)

    page_size_buttons = 3.times.map {mock}
    expects(:new_page_size_button).with('25', {}).returns(page_size_buttons[0])
    expects(:new_page_size_button).with('50', {}).returns(page_size_buttons[1])
    expects(:new_page_size_button).with('All', {}).returns(page_size_buttons[2])

    expects(:render).with(partial: 'pd/page_header', locals:
      {
        collection: collection,
        collection_name: 'collection name',
        page_buttons: page_buttons,
        page_size: 25,
        page_size_buttons: page_size_buttons
      }
    )

    # Call page_header helper method which should meet the above expectations
    page_header 'collection name', collection, permitted_params: [:allow]
  end

  # Creates expectations for new_page_button method calls with params based on the supplied param set,
  # and returns the generated mock buttons
  # @param buttons_param_set [Array<Hash>] An array of hashes, each with keys
  #   [:text, :page, :disabled] representing expected params to the new_page_button method
  # @return array of mock buttons that will be returned from the expectations
  def set_page_button_expectations(buttons_param_set)
    buttons_param_set.map do |button_params|
      text = button_params[:text]
      page = button_params[:page]
      disabled = button_params[:disabled]

      mock.tap do |mock_button|
        expects(:new_page_button).with(text, {page: page}, disabled: disabled).returns(mock_button)
      end
    end
  end
end
