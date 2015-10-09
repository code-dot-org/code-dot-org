#!/usr/bin/env ruby

def inner
  raise "This is a fake failure to test cronjob honeybadger logging for Andrew's manual test."
end

def outer
  inner
end

outer
