require 'test_helper'

class StudentLoginBadgeTest < ActiveSupport::TestCase
  setup do
    CDO.stubs(:student_badge_encryption_keys).returns({'1' => Base64.strict_encode64('a' * 32), '2' => Base64.strict_encode64('b' * 32)})
    CDO.stubs(:student_badge_encryption_key_version).returns('1')
    Policies::StudentBadges.stubs(:authentication_enabled?).returns(true)
    @teacher = create(:teacher)
    @section = create(:section, user: @teacher, login_type: 'picture')
    @student = create(:student, :sponsored)
    create(:follower, section: @section, student_user: @student)
    @badge = change('issue', generation: 0)
  end

  test 'credential is reusable and contains no personal information' do
    payload = @badge.payload
    2.times {assert_equal @badge, StudentLoginBadge.authenticate(payload)}
    refute_includes payload, @student.name
    refute_includes @badge.encrypted_secret, payload.split('.').last
    assert_equal payload, @badge.reload.payload
  end

  test 'replacement invalidates copies and sessions but retry does not rotate again' do
    payload = @badge.payload
    session = session_for(@badge)
    request_id = SecureRandom.uuid
    replacement = change('replace', generation: 1, request_id: request_id)
    assert_nil StudentLoginBadge.authenticate(payload)
    refute Services::StudentBadges::Session.valid?(session)
    assert_equal 2, replacement.generation
    assert_equal replacement.payload, change('replace', generation: 1, request_id: request_id).payload
    assert_raises(StudentLoginBadge::Conflict) {change('replace', generation: 1)}
  end

  test 'failed replacement preserves the previous credential' do
    payload = @badge.payload
    CDO.stubs(:student_badge_encryption_keys).returns({})
    assert_raises(StudentLoginBadge::KeyUnavailable) {change('replace', generation: 1)}
    assert_equal @badge, StudentLoginBadge.authenticate(payload)
    assert_equal 1, @badge.reload.generation
  end

  test 'key rotation preserves printed credentials' do
    payload = @badge.payload
    expiration = @badge.expires_at
    CDO.stubs(:student_badge_encryption_key_version).returns('2')
    @badge.rotate_encryption_key!
    assert_equal payload, @badge.reload.payload
    assert_equal expiration, @badge.expires_at
    assert_equal 1, @badge.generation
    CDO.stubs(:student_badge_encryption_keys).returns({})
    assert_equal @badge, StudentLoginBadge.authenticate(payload)
    assert_raises(StudentLoginBadge::KeyUnavailable) {@badge.payload}
  end

  test 'revocation removes reprint material and stops current sessions' do
    payload = @badge.payload
    session = session_for(@badge)
    change('revoke', generation: 1)
    assert_nil StudentLoginBadge.authenticate(payload)
    assert_nil @badge.reload.encrypted_secret
    refute Services::StudentBadges::Session.valid?(session)
  end

  test 'section removal preserves login and removes teacher authority' do
    payload = @badge.payload
    Follower.where(section: @section, student_user: @student).destroy_all
    assert_equal @badge, StudentLoginBadge.authenticate(payload)
    refute Policies::StudentBadges.manageable?(@teacher, @student, @section)
  end

  test 'expiry, emergency switch, and account role stop badge sessions' do
    session = session_for(@badge)
    assert Services::StudentBadges::Session.valid?(session)
    Policies::StudentBadges.stubs(:authentication_enabled?).returns(false)
    refute Services::StudentBadges::Session.valid?(session)
    Policies::StudentBadges.stubs(:authentication_enabled?).returns(true)
    @badge.update!(expires_at: 1.second.ago)
    refute Services::StudentBadges::Session.valid?(session)
    @badge.update!(expires_at: 1.day.from_now)
    @student.update_columns(user_type: 'teacher')
    refute Services::StudentBadges::Session.valid?(session)
  end

  test 'session deadlines do not extend merely through validation' do
    session = session_for(@badge)
    session['student_badge']['last_activity_at'] = 2.hours.ago.to_i
    refute Services::StudentBadges::Session.valid?(session)
    session['student_badge']['last_activity_at'] = Time.current.to_i
    session['student_badge']['authenticated_at'] = 12.hours.ago.to_i
    refute Services::StudentBadges::Session.valid?(session)
  end

  test 'malformed and incorrect payloads are rejected' do
    [nil, {}, 'a' * 1000, "\xff".b, @badge.payload.sub('CDO1', 'CDO2'), @badge.payload + "\n", @badge.payload.sub(/.$/, '!')].each do |payload|
      assert_nil StudentLoginBadge.authenticate(payload)
    end
    assert_nil StudentLoginBadge.authenticate("CDO1.#{@badge.public_id}.1.#{'A' * 43}")
  end

  test 'ciphertext tampering and substitution cannot be reprinted' do
    ciphertext = @badge.encrypted_secret.dup
    ciphertext[0] = ciphertext[0] == 'A' ? 'B' : 'A'
    @badge.update!(encrypted_secret: ciphertext)
    assert_raises(StudentLoginBadge::KeyUnavailable) {@badge.payload}
  end

  test 'independent login conversion preserves authentication but removes teacher authority' do
    payload = @badge.payload
    @student.update!(parent_email: 'parent@example.com', password: 'password123')
    assert_equal @badge, StudentLoginBadge.authenticate(payload)
    refute Policies::StudentBadges.manageable?(@teacher, @student.reload, @section)
  end

  test 'account erasure removes printable secret' do
    payload = @badge.payload
    @student.destroy!
    assert_nil @badge.reload.encrypted_secret
    assert_nil StudentLoginBadge.authenticate(payload)
  end

  test 'audit failure rolls back replacement' do
    payload = @badge.payload
    StudentLoginBadgeEvent.stubs(:create!).raises(ActiveRecord::StatementInvalid)
    assert_raises(ActiveRecord::StatementInvalid) {change('replace', generation: 1)}
    assert_equal payload, @badge.reload.payload
    assert_equal 1, @badge.generation
  end

  test 'admin and restricted LMS student cannot authenticate' do
    payload = @badge.payload
    @student.update_columns(admin: true)
    assert_nil StudentLoginBadge.authenticate(payload)
    @student.update_columns(admin: false)
    Policies::Lti.stubs(:restricted_user?).returns(true)
    assert_nil StudentLoginBadge.authenticate(payload)
  end

  test 'a student account with staff permissions cannot use a badge' do
    payload = @badge.payload
    @student.permissions.create!(permission: UserPermission::LEVELBUILDER)
    assert_nil StudentLoginBadge.authenticate(payload)
  end

  private def change(operation, generation:, request_id: SecureRandom.uuid)
    StudentLoginBadge.change!(student: @student, actor: @teacher, section: @section,
      operation: operation, expected_generation: generation, request_id: request_id
    )
  end

  private def session_for(badge)
    {'warden.user.user.key' => [[@student.id], 'salt'], 'student_badge' => Services::StudentBadges::Session.provenance(badge)}
  end
end
