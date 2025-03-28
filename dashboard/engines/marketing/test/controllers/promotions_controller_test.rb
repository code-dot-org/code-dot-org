require 'test_helper'
require 'contentful'

class Marketing::Teacher::PromotionsControllerTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  TestEntry = Struct.new(:id, :content_type, :fields, keyword_init: true)
  TestContentType = Struct.new(:id, keyword_init: true)

  describe '#show' do
    let(:locale) {'en-US'}
    let(:entry_id) {SecureRandom.hex(10)}
    let(:content_type) {TestContentType.new(id: 'teacherHomepageSidebar')}
    let(:entry) do
      TestEntry.new(
        content_type: content_type,
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
    let(:current_user) {create(:teacher)}

    before do
      Marketing::ContentfulClient.any_instance.expects(:entry).with(locale, entry_id).returns(entry)
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

    context 'when entry is the wrong content type' do
      let(:content_type) {TestContentType.new(id: 'wrongContentType')}

      it 'returns a 404' do
        get "/marketing/teacher/promotions/#{entry_id}"
        assert_response :not_found
      end
    end

    context 'when a promotion is hidden' do
      let(:hidden_promotion_id) {"abc123"}
      before do
        HiddenPromotion.create!(teacher: current_user, promotion_id: hidden_promotion_id)
      end

      it 'does not return hidden promotions' do
        sign_in current_user
        get "/marketing/teacher/promotions/#{entry_id}"
        assert_response :ok
        result = JSON.parse(@response.body)
        _(result).wont_include({'title' => 'Ad 1', 'id' => hidden_promotion_id})
      end
    end
  end

  describe '#hide' do
    let(:promotion_id) {'abc123'}
    let(:current_user) {create(:teacher)}

    before do
      sign_in current_user
    end

    it 'adds a HiddenPromotion' do
      assert_difference 'HiddenPromotion.count', 1 do
        post "/marketing/teacher/promotions/hide/#{promotion_id}"
      end
      assert_response :ok
      hidden_promotion = HiddenPromotion.last
      _(hidden_promotion.teacher).must_equal current_user
      _(hidden_promotion.promotion_id).must_equal promotion_id
    end
  end
end
