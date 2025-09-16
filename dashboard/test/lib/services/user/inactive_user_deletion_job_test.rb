require 'test_helper'

class User::InactiveUserDeletionJobTest < ActiveJob::TestCase
  subject(:perform_later) {User::InactiveUserDeletionJob.perform_later(dry_run: dry_run)}

  let(:dry_run) {false}
  let(:email) {Faker::Internet.unique.email}
  let!(:student) {create(:student, current_sign_in_at: 54.months.ago - 1.day)}
  let!(:teacher) {create(:teacher, current_sign_in_at: 54.months.ago - 1.day)}

  it 'enqueues job to "default" queue' do
    assert_enqueued_with(job: described_class, queue: 'default') do
      perform_later
    end
  end

  it 'deletes inactive user' do
    perform_enqueued_jobs {perform_later}
    student.reload
    teacher.reload
    _(student.deleted_at).wont_be_nil
    _(teacher.deleted_at).wont_be_nil
  end

  it 'does not delete active user' do
    active_student = create(:student)

    perform_enqueued_jobs {perform_later}
    active_student.reload

    _(active_student.deleted_at).must_be_nil
  end

  context 'when dry run' do
    let(:dry_run) {true}
    it 'does not destroy users in dry run mode' do
      User.any_instance.expects(:destroy!).never
      perform_enqueued_jobs {perform_later}
    end
  end
end
