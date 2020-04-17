require 'csv'
require 'time'
# Usage:
#   errors = HighFrequencyReporter.new(Slack.new)
#   errors.load!
#   loop do
#     <stuff>
#     errors.record "Something went wrong"
#   end
#   errors.report!
#   errors.save
class HighFrequencyReporter
  attr_accessor :new_events

  def initialize(chat_client, channel, log_file_name)
    @chat_client = chat_client
    @channel = channel
    # Load old events from disk
    # [{name: "eventblah", reported_at: '2020010...'}, ...]
    @old_events = []
    @new_events = []
    @filename = log_file_name
  end

  # Loads known events from previous run from a file on disk
  # Note that this method will swallow errors, primarily intended to catch
  # when a file containing old events doesn't exist (say, the first time this runs).
  # @return [Boolean] true if events were successfully loaded, false if not
  def load
    # Format for log file: CSV
    # @see https://ruby-doc.org/stdlib-2.6.1/libdoc/csv/rdoc/CSV.html
    # Header:
    #  "reported_at", "name"
    # Each row:
    #  2020-04-16 19:12:44 UTC, "error message"
    # Where error message is the full text of the error message (appropriately
    #   escaped by the CSV library)
    # And timestamp is the last time we reported this error to Slack,
    #   recorded in ISO 8601 format
    if File.file? @filename
      @old_events = CSV.read(@filename, headers: true).map do |row|
        row.to_h.transform_keys(&:to_sym).tap do |h|
          h[:reported_at] = Time.parse(h[:reported_at])
        end
      end
      true
    else
      false
    end
  end

  # Add a new event to our record for the current run
  # @param [String] event_name
  def record(event_name)
    @new_events << {reported_at: Time.now.utc, name: event_name}
  end

  # Reports alertable events to chat client
  # if current minute is multiple of throttle.
  # Defaults to always report alertable events unless throttled.
  # Note that this really relies on your chat client having a
  # method called "message" that takes a message and a channel as a param,
  # so mostly limited to Slack as-is.
  # @param [Integer] throttle
  def report!(throttle = 1)
    if Time.now.min % throttle == 0
      alertable_events.each {|e| @chat_client.message(e, {channel: @channel})}
    end
  end

  # Saves known events and last report timestamps out to disk
  def save
    CSV.open(@filename, 'wb', headers: %i[reported_at name], write_headers: true) do |csv|
      @new_events.each do |event|
        csv << event.values
      end
    end
  end

  def alertable_events
    @new_events.map {|e| e[:name]} & @old_events.map {|e| e[:name]}
  end

  def reset_new_events
    @new_events = []
  end
end
