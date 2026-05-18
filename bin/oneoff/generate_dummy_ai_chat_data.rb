#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'
require 'optparse'
require 'securerandom'

DEFAULT_COUNTS = {
  old_events: 0,
  old_requests: 200_000,
  recent_events: 0,
  recent_requests: 2_000_000,
  fk_retry_requests: 1_000
}.freeze

DEFAULT_BATCH_SIZE = 10_000
OLD_EVENT_AGE_DAYS = (91..180)
OLD_REQUEST_AGE_DAYS = (92..180)
RECENT_EVENT_AGE_DAYS = (1..30)
RECENT_REQUEST_AGE_DAYS = (1..30)

def random_time_between(from_time, to_time)
  Time.zone.at(rand(from_time.to_f..to_time.to_f))
end

def build_request_payload(options)
  stored_message_text = 's' * options[:stored_message_chars]
  new_message_text = 'u' * options[:new_message_chars]
  response_text = 'r' * options[:response_chars]
  stored_messages_count = rand(options[:stored_messages_min]..options[:stored_messages_max])
  stored_messages = Array.new(stored_messages_count) do |i|
    {
      role: i.even? ? 'user' : 'assistant',
      chatMessageText: stored_message_text
    }
  end

  {
    model_customizations: {},
    stored_messages: stored_messages,
    new_message: {role: 'user', chatMessageText: new_message_text},
    response: response_text
  }
end

def insert_requests!(count:, user_id:, from_time:, to_time:, batch_size:, options:)
  inserted = 0

  while inserted < count
    rows_to_insert = [batch_size, count - inserted].min
    rows = Array.new(rows_to_insert) do
      created_at = random_time_between(from_time, to_time)
      payload = build_request_payload(options)
      {
        user_id: user_id,
        model_customizations: payload[:model_customizations],
        stored_messages: payload[:stored_messages],
        new_message: payload[:new_message],
        execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:NOT_STARTED],
        response: payload[:response],
        created_at: created_at,
        updated_at: created_at
      }
    end
    AichatRequest.insert_all!(rows)
    inserted += rows_to_insert
    puts "Inserted #{inserted}/#{count} requests" if inserted % (batch_size * 5) == 0 || inserted == count
  end
end

def create_event!(user_id:, created_at:, request_id: nil)
  AichatEvent.create!(
    user_id: user_id,
    request_id: request_id,
    aichat_event: {
      eventType: 'MODEL_CUSTOMIZATION_OPEN',
      requestId: request_id,
      source: 'dummy_data_script'
    },
    created_at: created_at,
    updated_at: created_at
  )
end

def main
  options = DEFAULT_COUNTS.merge(
    user_id: nil,
    requests_only: false,
    batch_size: DEFAULT_BATCH_SIZE,
    stored_messages_min: 0,
    stored_messages_max: 10,
    stored_message_chars: 120,
    new_message_chars: 80,
    response_chars: 120
  )

  OptionParser.new do |opts|
    opts.banner = "Usage: #{$PROGRAM_NAME} [options]"

    opts.on('--user-id ID', Integer, 'Use an existing user id (default: User.first.id)') {|v| options[:user_id] = v}
    opts.on('--requests-only', 'Generate only requests plus FK-test events') {options[:requests_only] = true}
    opts.on('--batch-size N', Integer, "Batch size for request insert_all! (default #{DEFAULT_BATCH_SIZE})") {|v| options[:batch_size] = v}
    opts.on('--old-events N', Integer, "Old events (>90 days), default #{DEFAULT_COUNTS[:old_events]}") {|v| options[:old_events] = v}
    opts.on('--old-requests N', Integer, "Old requests (>91 days), default #{DEFAULT_COUNTS[:old_requests]}") {|v| options[:old_requests] = v}
    opts.on('--recent-events N', Integer, "Recent events (<90 days), default #{DEFAULT_COUNTS[:recent_events]}") {|v| options[:recent_events] = v}
    opts.on('--recent-requests N', Integer, "Recent requests (<91 days), default #{DEFAULT_COUNTS[:recent_requests]}") {|v| options[:recent_requests] = v}
    opts.on('--fk-retry-requests N', Integer, "Old requests with recent events, default #{DEFAULT_COUNTS[:fk_retry_requests]}") {|v| options[:fk_retry_requests] = v}
    opts.on('--stored-messages-min N', Integer, 'Minimum messages per request in stored_messages (default 0)') {|v| options[:stored_messages_min] = v}
    opts.on('--stored-messages-max N', Integer, 'Maximum messages per request in stored_messages (default 10)') {|v| options[:stored_messages_max] = v}
    opts.on('--stored-message-chars N', Integer, 'Characters per stored_messages entry (default 120)') {|v| options[:stored_message_chars] = v}
    opts.on('--new-message-chars N', Integer, 'Characters in new_message.chatMessageText (default 80)') {|v| options[:new_message_chars] = v}
    opts.on('--response-chars N', Integer, 'Characters in response text (default 120)') {|v| options[:response_chars] = v}
  end.parse!

  if options[:requests_only]
    options[:old_events] = 0
    options[:recent_events] = 0
  end

  abort '--batch-size must be > 0' if options[:batch_size] <= 0
  abort '--stored-messages-min must be >= 0' if options[:stored_messages_min] < 0
  abort '--stored-messages-max must be >= 0' if options[:stored_messages_max] < 0
  abort '--stored-messages-max must be >= --stored-messages-min' if options[:stored_messages_max] < options[:stored_messages_min]
  abort '--stored-message-chars must be > 0' if options[:stored_message_chars] <= 0
  abort '--new-message-chars must be > 0' if options[:new_message_chars] <= 0
  abort '--response-chars must be > 0' if options[:response_chars] <= 0

  user = options[:user_id] ? User.find_by(id: options[:user_id]) : User.first
  abort 'No user found. Pass --user-id with an existing user id.' unless user

  now = Time.zone.now
  created = Hash.new(0)

  old_event_from = OLD_EVENT_AGE_DAYS.max.days.ago
  old_event_to = OLD_EVENT_AGE_DAYS.min.days.ago
  old_request_from = OLD_REQUEST_AGE_DAYS.max.days.ago
  old_request_to = OLD_REQUEST_AGE_DAYS.min.days.ago
  recent_event_from = RECENT_EVENT_AGE_DAYS.max.days.ago
  recent_event_to = RECENT_EVENT_AGE_DAYS.min.days.ago
  recent_request_from = RECENT_REQUEST_AGE_DAYS.max.days.ago
  recent_request_to = RECENT_REQUEST_AGE_DAYS.min.days.ago

  if options[:old_events] > 0
    options[:old_events].times do
      create_event!(
        user_id: user.id,
        created_at: random_time_between(old_event_from, old_event_to)
      )
      created[:old_events] += 1
    end
  end

  created[:old_requests] = options[:old_requests]
  insert_requests!(
    count: options[:old_requests],
    user_id: user.id,
    from_time: old_request_from,
    to_time: old_request_to,
    batch_size: options[:batch_size],
    options: options
  )

  if options[:recent_events] > 0
    options[:recent_events].times do
      create_event!(
        user_id: user.id,
        created_at: random_time_between(recent_event_from, recent_event_to)
      )
      created[:recent_events] += 1
    end
  end

  created[:recent_requests] = options[:recent_requests]
  insert_requests!(
    count: options[:recent_requests],
    user_id: user.id,
    from_time: recent_request_from,
    to_time: recent_request_to,
    batch_size: options[:batch_size],
    options: options
  )

  ActiveRecord::Base.transaction do
    # These old requests will fail initial delete_all due to FK refs from recent events.
    # They should exercise delete_old_ai_chat_data's InvalidForeignKey retry branch.
    options[:fk_retry_requests].times do
      old_request_time = random_time_between(old_request_from, old_request_to)
      recent_event_time = random_time_between(recent_event_from, recent_event_to)
      request_payload = build_request_payload(options)
      request = AichatRequest.create!(
        user_id: user.id,
        model_customizations: request_payload[:model_customizations],
        stored_messages: request_payload[:stored_messages],
        new_message: request_payload[:new_message],
        response: request_payload[:response],
        created_at: old_request_time,
        updated_at: old_request_time
      )
      create_event!(user_id: user.id, request_id: request.id, created_at: recent_event_time)
      created[:fk_retry_requests] += 1
      created[:fk_retry_events] += 1
    end
  end

  puts "Created dummy Aichat data for user_id=#{user.id} at #{now}."
  puts "requests_only=#{options[:requests_only]}"
  puts "batch_size=#{options[:batch_size]}"
  puts "stored_messages_min=#{options[:stored_messages_min]}"
  puts "stored_messages_max=#{options[:stored_messages_max]}"
  puts "stored_message_chars=#{options[:stored_message_chars]}"
  puts "new_message_chars=#{options[:new_message_chars]}"
  puts "response_chars=#{options[:response_chars]}"
  puts "old_events=#{created[:old_events]}"
  puts "old_requests=#{created[:old_requests]}"
  puts "recent_events=#{created[:recent_events]}"
  puts "recent_requests=#{created[:recent_requests]}"
  puts "fk_retry_requests=#{created[:fk_retry_requests]}"
  puts "fk_retry_events=#{created[:fk_retry_events]}"
  puts "Run cleanup script: bin/cron/delete_old_ai_chat_data"
end

main
