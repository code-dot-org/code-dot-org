#!/usr/bin/env ruby

require_relative 'only_one'
require_relative '../../dashboard/config/environment'

BANNED_USERS = [
  {user_id: 101_790_034, banned_datetime: '2021-09-15 00:00:00'},
]
NOTIFY_CHANNEL = 'infrastructure'

# @param message [String] the (base) error message to log.
def alert(message)
  ChatClient.message(NOTIFY_CHANNEL, msg, color: 'red')
end

def main
  # iterate over BANNED_USERS and get count of new projects
  BANNED_USERS.each do |banned_user|
    user_id = banned_user[:user_id]
    since = banned_user[:banned_datetime]

    user = User.find(user_id)
    projects = Project.where(storage_id: user.user_storage_id, created_at: since.., abuse_score: ..0)

    projects.each {|project| alert "User #{user_id} has a new project:\n`project_id: '#{project.id}', channel_id: '#{project.channel_id}', created_at: '#{project.created_at}'`"}
  end
end

main
