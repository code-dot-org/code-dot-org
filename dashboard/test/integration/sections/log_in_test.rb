require 'test_helper'

class SectionsLogInTest < ActionDispatch::IntegrationTest
  let(:section) {create(:section, :picture_password)}
  let(:student_a) {create(:follower, section: section).student_user}
  let(:student_b) {create(:follower, section: section).student_user}

  before do
    log_in student_a
  end

  def log_in(student)
    post "/sections/#{section.code}/log_in", params: {
      user_id: student.id,
      secret_picture_id: student.secret_picture_id,
    }

    assert_redirected_to '/'
    follow_redirect!

    _(@controller.current_user).must_equal student
  end

  it 'gives next student new Statsig stable ID from session' do
    get '/v3/channels'

    stable_id_a = session[SharedConstants::STATSIG_STABLE_ID_KEY]
    _(stable_id_a).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io

    log_in student_b

    _(request.existing_statsig_stable_id).wont_equal stable_id_a
  end

  context 'with Statsig cookie of previous student' do
    let(:stable_id_a) {SecureRandom.uuid}

    before do
      # As set by apps/src/metrics/statsigHelpers.js.
      cookies.merge("#{SharedConstants::STATSIG_STABLE_ID_KEY}=#{stable_id_a}; domain=.code.org; path=/")
    end

    it 'expires cookie' do
      log_in student_b

      _(request.statsig_stable_id).wont_equal stable_id_a
      _(request.anon_user_id).wont_equal stable_id_a
    end

    it 'records SignIn of next student with new anon_user_id' do
      log_in student_b

      _(SignIn.where(user: student_b).last.anon_user_id).wont_equal stable_id_a
    end
  end
end
