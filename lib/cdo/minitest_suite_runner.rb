# Adds #suite_setup, #suite_around and #suite_teardown lifecycle hooks to MiniTest suite classes.
module Cdo
  module MiniTestSuiteRunner
    def run(reporter, options = {})
      suite = self.new('suite')
      suite.suite_setup if suite.respond_to? :suite_setup
      if suite.respond_to?(:suite_around)
        suite.suite_around { super reporter, options }
      else
        super reporter, options
      end
      suite.suite_teardown if suite.respond_to? :suite_teardown
    end
  end
end

MiniTest::Runnable.singleton_class.prepend Cdo::MiniTestSuiteRunner
