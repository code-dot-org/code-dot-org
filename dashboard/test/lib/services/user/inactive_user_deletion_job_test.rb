require 'test_helper'
#require 'cdo/delete_accounts_helper'

class User::InactiveUserDeletionJobTest < ActiveJob::TestCase
  #include Minitest::RSpecMocks

  subject(:perform_later) {User::InactiveUserDeletionJob.perform_later}

  let(:email) {Faker::Internet.unique.email}
  let!(:student) {create(:student, current_sign_in_at: 54.months.ago - 1.day)}
  let!(:teacher) {create(:teacher, current_sign_in_at: 54.months.ago - 1.day)}

  it 'enqueues job to "default" queue' do
    assert_enqueued_with(job: described_class, queue: 'default') do
      perform_later
    end
  end

  it 'sends' do
    perform_enqueued_jobs {perform_later}
    student.reload
    teacher.reload
    puts student.summarize
    _(student.deleted_at).wont_be_nil
    _(teacher.deleted_at).wont_be_nil
  end
end
