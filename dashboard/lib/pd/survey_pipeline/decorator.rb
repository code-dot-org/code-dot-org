module Pd::SurveyPipeline
  class DecoratorBase
    def self.decorate(*)
      raise 'Must override in derived class'
    end
  end
end
