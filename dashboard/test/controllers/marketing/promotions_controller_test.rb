require 'test_helper'
require 'contentful'

class Marketing::Teacher::PromotionsControllerTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  TestEntry = Struct.new(:id, :content_type, :fields, keyword_init: true)
  TestContentType = Struct.new(:id, keyword_init: true)

  describe '#show' do
    let(:locale) {'en-US'}
    let(:entry_id) {SecureRandom.hex(10)}
    let(:entry) do
      TestEntry.new(
        content_type: 'teacherHomepageSidebar',
        fields: {
          sidebar_ads: [
            TestEntry.new(
              id: 1,
              fields: {
                title: 'Ad 1',
              }
            ),
            TestEntry.new(
              id: 2,
              fields: {
                title: 'Ad 2',
              }
            ),
          ]
        },
      )
    end
    let(:expected_result) do
      [
        {
          title: 'Ad 1',
          id: 1
        },
        {
          title: 'Ad 2',
          id: 2
        }
      ].to_json
    end

    before do
      CdoContentful::Marketing::Entry::TeacherHomepageSidebar.stubs(:find).with(entry_id).returns(entry)
    end

    it 'returns teacher sidebar json' do
      get "/marketing/teacher/promotions/#{entry_id}"
      assert_response :ok
      _(@response.body).must_equal expected_result
    end

    context 'when the entry does not exist' do
      let(:entry) {nil}

      it 'returns a 404' do
        get "/marketing/teacher/promotions/#{entry_id}"
        assert_response :not_found
      end
    end
  end
end
