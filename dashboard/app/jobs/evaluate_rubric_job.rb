require 'json'
require 'cdo/pycall'

class EvaluateRubricJob < ApplicationJob
  queue_as :default

  def perform(*args)
    raise 'OPENAI_API_KEY required' unless ENV['OPENAI_API_KEY']

    math = PyCall.import_module('math')
    puts "math.pi = #{math.pi}"
    PyCall.import_module('openai')
  end
end
