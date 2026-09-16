require 'test_helper'

class StudentLoginBadgeConcurrencyTest < ActiveSupport::TestCase
  self.use_transactional_tests = false
  self.pre_loaded_fixtures = false

  test 'concurrent issuance and replacement keep exactly one winning generation' do
    CDO.stubs(:student_badge_encryption_keys).returns({'1' => Base64.strict_encode64('a' * 32)})
    CDO.stubs(:student_badge_encryption_key_version).returns('1')
    Policies::StudentBadges.stubs(:authentication_enabled?).returns(true)
    usernames = %w[student teacher].map {|type| "badge-race-#{type}-#{SecureRandom.hex(6)}"}
    User.insert_all!(usernames.each_with_index.map do |username, index|
      {username: username, user_type: index.zero? ? 'student' : 'teacher', name: 'Badge test', provider: 'sponsored'}
    end
    )
    users = User.where(username: usernames).order(:id).to_a
    student, teacher = users
    assert_equal [:changed, :conflict], race(student.id, teacher.id, 'issue', 0).sort
    assert_equal 1, StudentLoginBadge.where(user_id: student.id).count
    badge = StudentLoginBadge.find_by!(user_id: student.id)
    old_payload = badge.payload
    assert_equal [:changed, :conflict], race(student.id, teacher.id, 'replace', 1).sort
    assert_equal 2, badge.reload.generation
    assert_nil StudentLoginBadge.authenticate(old_payload)
    assert_equal 2, StudentLoginBadgeEvent.where(user_id: student.id).count
  ensure
    if users
      ids = users.map(&:id)
      StudentLoginBadgeEvent.where(user_id: ids).delete_all
      StudentLoginBadge.where(user_id: ids).delete_all
      User.where(id: ids).delete_all
    end
  end

  private def race(student_id, teacher_id, operation, generation)
    ready = Queue.new
    start = Queue.new
    workers = Array.new(2) do
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          student = User.find(student_id)
          teacher = User.find(teacher_id)
          ready << true
          start.pop
          StudentLoginBadge.change!(
            student: student, actor: teacher, section: Section.new(id: 0), operation: operation,
            expected_generation: generation, request_id: SecureRandom.uuid
          )
          :changed
        rescue StudentLoginBadge::Conflict
          :conflict
        end
      end
    end
    2.times {ready.pop}
    2.times {start << true}
    workers.map(&:value)
  ensure
    workers&.each(&:join)
  end
end
