require_relative '../../deployment'
require 'cdo/chat_client'
require 'cdo/i18n_utils'

descriptions = {
  in: 'gather all changes to our source strings, prepare to upload to crowdin',
  up: 'upload source strings to crowdin',
  down: 'download tranaslation strings from crowdin',
  out: 'distribute translation strings from crowdin to our application'
}

class ChatLogger < Logger
  def add(severity, message = nil, progname = nil)
    severity ||= Logger::UNKNOWN
    return true if @logdev.nil? || severity < @level
    progname ||= @progname
    if message.nil?
      if block_given?
        message = yield
      else
        message = progname
        progname = @progname
      end
    end

    # everything above this line is duplicated directly from logger.rb
    color = severity_to_color(severity)
    ChatClient.log(progname, {color: color}) if progname
    ChatClient.log(message, {color: color})
  end

  private

  def severity_to_color(severity)
    case severity
    when Logger::DEBUG
      :green
    when Logger::INFO
      nil
    when Logger::WARN
      :yellow
    when Logger::ERROR
      :red
    when Logger::FATAL
      :red
    when Logger::UNKNOWN
      :purple
    end
  end
end

namespace :i18n do
  namespace :sync do
    desc 'syncronize internationalization strings with crowdin'
    task all: [:in, :up, :down, :out] # order is important

    i18n_utils = I18nUtils.new(logger: ChatLogger.new(STDOUT))
    descriptions.each do |name, description|
      desc description
      task name do
        ChatClient.wrap("sync #{name}") do
          i18n_utils.send(name)
        end
      end
    end
  end
end
