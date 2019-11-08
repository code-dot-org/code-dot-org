require 'logger'

class I18nUtils
  def initialize(logger: Logger.new(STDOUT))
    @logger = logger
  end

  def in
    @logger.info("in!")
  end

  def up
    @logger.warn("up!")
  end

  def down
    @logger.error("down!")
  end

  def out
    @logger.debug("out!")
  end
end
