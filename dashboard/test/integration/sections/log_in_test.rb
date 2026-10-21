require 'test_helper'

class SectionsLogInTest < ActionDispatch::IntegrationTest
  let(:section) {create(:section, :picture_password)}
  let(:student_a) {create(:follower, section: section).student_user}
  let(:partner_a) {create(:follower, section: section).student_user}
  let(:student_b) {create(:follower, section: section).student_user}

  before do
    log_in student_a
  end

  it 'assigns new Statsig stable ID' do
    stable_id_a = session[SharedConstants::STATSIG_STABLE_ID_KEY]
    _(stable_id_a).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io
    _(request.statsig_stable_id).must_equal stable_id_a

    log_in student_b

    stable_id_b = session[SharedConstants::STATSIG_STABLE_ID_KEY]
    _(stable_id_b).wont_equal stable_id_a
    _(stable_id_b).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io
  end

  it 'assigns new anon_user_id' do
    stable_id_a = session[SharedConstants::STATSIG_STABLE_ID_KEY]
    _(stable_id_a).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io

    _(request.anon_user_id).must_equal stable_id_a
    _(SignIn.where(user: student_a).last.anon_user_id).must_equal stable_id_a

    log_in student_b

    _(request.anon_user_id).wont_equal stable_id_a
    _(request.anon_user_id).must_match Cdo::AnonUserId::FORMAT
    _(SignIn.where(user: student_b).last.anon_user_id).must_equal request.anon_user_id
  end

  it 'clears pairings of previous student' do
    put '/pairing', params: {pairings: [{id: partner_a.id}], sectionId: section.id}, as: :json
    _(session[:pairings]).must_equal [partner_a.id]

    log_in student_b

    _(session[:pairings]).must_be_nil
  end

  it 'keeps session of same student signing in again' do
    _ {log_in student_a}.wont_change -> {request.statsig_stable_id}
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

    it 'records SignIn of next student with new anon_user_id' do
      _(request.anon_user_id).must_equal stable_id_a

      log_in student_b

      _(request.anon_user_id).wont_equal stable_id_a
      _(request.anon_user_id).must_match Cdo::AnonUserId::FORMAT
      _(SignIn.where(user: student_b).last.anon_user_id).must_equal request.anon_user_id
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
