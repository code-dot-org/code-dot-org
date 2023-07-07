require 'test_helper'

class FollowerTest < ActiveSupport::TestCase
  setup do
    @laurel = create(:teacher)
    @laurel_section = create(:section, user: @laurel)
    @follower = create :follower
  end

  test 'student_user is required' do
    @follower.student_user = nil
    refute @follower.valid?
    assert_equal ['Student user is required'], @follower.errors.full_messages
  end

  test 'section is required' do
    @follower.section = nil
    refute @follower.valid?
    assert_equal ['Section is required'], @follower.errors.full_messages
  end

  test 'admins cannot be student followers' do
    assert_does_not_create(Follower) do
      assert_raises do
        create :follower, student_user: (create :admin)
      end
    end
  end

  # Ideally this test would also confirm cannot_follow_yourself and teacher_must_be_teacher are only
  # validated for non-deleted followers. As this situation cannot happen without manipulating the DB
  # (dependent callbacks), we do not worry about testing it.
  test 'student_user and section not required for deleted followers' do
    follower = create :follower
    follower.destroy
    follower.student_user = nil
    follower.section = nil

    assert follower.valid?
  end

  test "followers are soft-deleted" do
    assert_no_change("Follower.with_deleted.count") do
      @follower.destroy
      assert @follower.reload.deleted?
    end
  end

  test "undeleting follower does not undelete section" do
    @follower.section.destroy

    @follower.restore
    @follower.reload

    refute @follower.deleted?
    assert @follower.section.nil?
    assert Section.with_deleted.find_by_id(@follower.section_id).deleted?
  end

  test "cannot follow yourself" do
    assert_does_not_create(Follower) do
      follower = Follower.create(
        user: @laurel,
        student_user: @laurel,
        section: @laurel_section
      )
      refute follower.valid?
    end
  end

  test 'deleting a follower deletes the associated code review group member' do
    code_review_group = create :code_review_group, section: @laurel_section
    create :code_review_group_member, follower: @follower, code_review_group: code_review_group
    @follower.destroy
    refute CodeReviewGroupMember.exists?(follower_id: @follower.id, code_review_group_id: code_review_group.id)
  end

  test 'deleting a follower removes the associated student family name' do
    DCDO.stubs(:get).with('family-name-features', false).returns(true)

    student = @follower.student_user
    student.family_name = 'test'
    student.save!
    student.reload

    assert_equal 'test', student.family_name

    @follower.destroy
    student.reload

    assert_nil student.family_name

    DCDO.unstub(:get)
  end

  test 'family name removal is behind the DCDO flag' do
    DCDO.stubs(:get).with('family-name-features', false).returns(false)

    student = @follower.student_user
    student.family_name = 'test'
    student.save!
    student.reload

    assert_equal 'test', student.family_name

    @follower.destroy
    student.reload

    assert_equal 'test', student.family_name

    DCDO.unstub(:get)
  end

  test 'deleting one of many followers keeps the associated student family name' do
    DCDO.stubs(:get).with('family-name-features', false).returns(true)

    student = @follower.student_user
    student.family_name = 'test'
    student.save!
    student.reload

    create(:follower, student_user: student)

    assert_equal 'test', student.family_name

    @follower.destroy
    student.reload

    assert_equal 'test', student.family_name

    DCDO.unstub(:get)
  end

  test 'cannot create a follower for a PL section and a user with a family name' do
    teacher = create(:teacher)
    pl_section = create :section, :teacher_participants, user_id: teacher.id

    pl_participant = create(:user)
    pl_participant.family_name = 'TestFamName'
    pl_participant.save!

    assert_raises(ActiveRecord::RecordInvalid) do
      create :follower, section: pl_section, student_user: pl_participant
    end
  end
end
