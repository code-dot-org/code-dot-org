#!/usr/bin/env ruby
require 'aws-sdk-s3'
require 'parallel'

def run_on(server_name, command)
  # Double-escape the command string, once for each remote shell we're passing
  # through.
  return true if system "sshd -t gateway.code.org ssh -t #{server_name} #{command.inspect.inspect}"
  # Non-zero exit code from the command
  puts "There was an error running `#{command}` on #{server_name}"
  return false
end

class CucumberTests
  def initialize(bucket_name, prefix)
    bucket = Aws::S3::Bucket.new(bucket_name)
    objects = bucket.objects({prefix: prefix})
    @@tests = []
    Parallel.map(objects, in_threads: Parallel.processor_count) do |aws_summary|
      @@tests.append(CucumberTest.new(aws_summary, bucket))
    end
  end

  def print_tests
    @@tests.each do |test|
      puts test.inspectend
    end
  end
end

class CucumberTest
  def initialize(aws_summary, bucket)
    @summary_key = aws_summary.key
    @last_modified = aws_summary.last_modified
    object = bucket.object(aws_summary.key)
    @commit = object.metadata['commit']
    @attempt = object.metadata['attempt']
    @is_successful = object.metadata['success']
    @duration = object.metadata['duration']
    @is_eyes_test = aws_summary.key.include? '_eyes_'
  end
end
