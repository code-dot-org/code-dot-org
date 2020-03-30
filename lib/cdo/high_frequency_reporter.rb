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
#   errors.save!
class HighFrequencyReporter
  attr_reader :new_events, :old_events

  def initialize(chat_client, log_file_name)
    @chat_client = chat_client
    # Load old events from disk
    # [{name: "eventblah", reported_at: '2020010...'}, ...]
    @old_events = []
    @new_events = []
    @filename = log_file_name
  end

  # Loads known events from previous runs from a file on disk
  def load
    # Format for log file: CSV
    # @see https://ruby-doc.org/stdlib-2.6.1/libdoc/csv/rdoc/CSV.html
    # Each row:
    #   "error message","timestamp"
    # Where error message is the full text of the error message (appropriately
    #   escaped by the CSV library)
    # And timestamp is the last time we reported this error to Slack,
    #   recorded in ISO 8601 format
    @old_events = CSV.read(@filename, headers: true).map do |row|
      row.to_h.transform_keys(&:to_sym).tap do |h|
        h[:reported_at] = Time.parse(h[:reported_at])
        #h[:last_slack_reported_at] = Time.parse(h[:last_slack_reported_at])
      end
    end
  rescue
    # Okay to do nothing here.
  end

  # Add a new event to our record for the current run
  # @param [String] event_name
  def record(event_name)
    @new_events << {name: event_name, reported_at: Time.now}
  end

  def report!(throttle = 1)
    alertable_events = @new_events.map {|e| e[:name]} & @old_events.map {|e| e[:name]}
    puts Time.now.min
    if Time.now.min % throttle == 0
      alertable_events.each {|e| @chat_client.message(e)}
    end
  end

  # Saves known events and last report timestamps out to disk
  def save
    CSV.open(@filename, 'wb', headers: %i[name reported_at], write_headers: true) do |csv|
      @new_events.each do |event|
        csv << event.values
      end
    end
  end
end
