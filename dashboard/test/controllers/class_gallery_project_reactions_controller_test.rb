require 'test_helper'

class ClassGalleryProjectReactionsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  let(:teacher) {create(:teacher)}
  let(:section) {create(:section, user: teacher)}
  let(:student) {create(:student)}
  let(:classmate) {create(:student)}
  let(:outsider) {create(:student)}

  let(:project) {create(:project, owner: student)}
  let(:channel_id) {project.channel_id}

  let(:response_json) {JSON.parse(response.body)}

  before do
    create(:follower, section:, student_user: student)
    create(:follower, section:, student_user: classmate)
  end

  def react(emoji)
    post :create, params: {class_gallery_project_channel_id: channel_id, emoji: emoji}
  end

  describe 'POST #create' do
    it 'redirects signed-out users to sign in' do
      react('heart')
      assert_redirected_to_sign_in
    end

    describe 'as a classmate' do
      before {sign_in classmate}

      it 'adds the reaction and returns the tallies' do
        assert_difference -> {ProjectReaction.where(project: project).count}, 1 do
          react('heart')
        end
        assert_response :success
        _(response_json['reactions']).must_equal [{'emoji' => 'heart', 'count' => 1, 'reacted' => true}]
      end

      it 'is idempotent' do
        react('heart')
        assert_no_difference -> {ProjectReaction.count} do
          react('heart')
        end
        assert_response :success
      end

      it 'rejects an emoji outside the vocabulary' do
        react('rocket')
        assert_response :unprocessable_entity
        _(ProjectReaction.count).must_equal 0
      end
    end

    it "lets the owner's teacher react" do
      sign_in teacher
      react('clap')
      assert_response :success
    end

    it 'lets the owner react' do
      sign_in student
      react('trophy')
      assert_response :success
    end

    it 'refuses a user who shares no section with the owner' do
      sign_in outsider
      react('heart')
      assert_response :forbidden
      _(ProjectReaction.count).must_equal 0
    end
  end

  describe 'DELETE #destroy' do
    it "removes only the caller's reaction" do
      create(:project_reaction, project:, user: student, emoji: 'heart')
      create(:project_reaction, project:, user: classmate, emoji: 'heart')
      sign_in classmate

      delete :destroy, params: {class_gallery_project_channel_id: channel_id, emoji: 'heart'}

      assert_response :success
      _(response_json['reactions']).must_equal [{'emoji' => 'heart', 'count' => 1, 'reacted' => false}]
    end

    it 'is a no-op when the reaction is absent' do
      sign_in classmate
      delete :destroy, params: {class_gallery_project_channel_id: channel_id, emoji: 'heart'}
      assert_response :success
      _(response_json['reactions']).must_equal []
    end
  end
end
