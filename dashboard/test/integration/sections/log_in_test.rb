require 'test_helper'

class SectionsLogInTest < ActionDispatch::IntegrationTest
  let(:section) {create(:section, :picture_password)}
  let(:student_a) {create(:follower, section: section).student_user}
  let(:partner_a) {create(:follower, section: section).student_user}
  let(:student_b) {create(:follower, section: section).student_user}

  before do
    log_in student_a
  end

  it 'does not assign Statsig stable ID' do
    _(session[SharedConstants::STATSIG_STABLE_ID_KEY]).must_be_nil
  end

  it 'assigns new anon_user_id' do
    anon_user_id_a = cookies[Cdo::AnonUserId::KEY]
    _(anon_user_id_a).must_match Cdo::AnonUserId::FORMAT
    _(SignIn.where(user: student_a).last.anon_user_id).must_equal anon_user_id_a

    log_in student_b

    anon_user_id_b = cookies[Cdo::AnonUserId::KEY]
    _(anon_user_id_b).wont_equal anon_user_id_a
    _(anon_user_id_b).must_match Cdo::AnonUserId::FORMAT
    _(SignIn.where(user: student_b).last.anon_user_id).must_equal anon_user_id_b
  end

  it 'clears pairings of previous student' do
    put '/pairing', params: {pairings: [{id: partner_a.id}], sectionId: section.id}, as: :json
    _(session[:pairings]).must_equal [partner_a.id]

    log_in student_b

    _(session[:pairings]).must_be_nil
  end

  it 'keeps anon_user_id of same student signing in again' do
    _ {log_in student_a}.wont_change -> {cookies[Cdo::AnonUserId::KEY]}
  end

  context 'with Statsig cookie of previous student' do
    let(:stable_id_a) {SecureRandom.uuid}

    before do
      # As set by apps/src/metrics/statsigHelpers.js.
      cookies.merge("#{SharedConstants::STATSIG_STABLE_ID_KEY}=#{stable_id_a}; domain=.code.org; path=/")
      get '/'
    end

    it 'assigns new Statsig stable ID from cookie' do
      _(request.statsig_stable_id).must_equal stable_id_a

      log_in student_b

      _(request.statsig_stable_id).wont_equal stable_id_a
      _(request.statsig_stable_id).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io
    end

    it 'records SignIn of next student without Statsig stable ID' do
      log_in student_b

      _(SignIn.where(user: student_b).last.anon_user_id).wont_equal stable_id_a
      _(SignIn.where(user: student_b).last.anon_user_id).must_equal cookies[Cdo::AnonUserId::KEY]
    end
  end

  private def log_in(student)
    post "/sections/#{section.code}/log_in", params: {
      user_id: student.id,
      secret_picture_id: student.secret_picture_id,
    }

    assert_redirected_to '/'
    follow_redirect!

    _(@controller.current_user).must_equal student
  end
end
