require 'test_helper'

class UserPermissionTest < ActiveSupport::TestCase
  test 'Log granting of levelbuilder permission to slack' do
    levelbuilder = create :teacher
    UserPermission.stubs(:should_log?).returns(true)
    ChatClient.
      expects(:message).
      with('infra-security',
        "Updating UserPermission: environment: #{rack_env}, " \
        "user ID: #{levelbuilder.id}, " \
        "email: #{levelbuilder.email}, " \
        "permission: levelbuilder",
        color: 'yellow'
      ).
      returns(true)

    levelbuilder.permission = UserPermission::LEVELBUILDER
  end

  test 'Does not log granting of authorized teacher permission to slack' do
    authorized_teacher = create :teacher
    UserPermission.stubs(:should_log?).returns(true)
    ChatClient.expects(:message).never

    authorized_teacher.permission = UserPermission::AUTHORIZED_TEACHER
  end
end
