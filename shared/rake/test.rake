require 'rake/testtask'

Rake::TestTask.new do |t|
  t.libs << shared_dir('test')
end
