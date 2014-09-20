require 'rake/testtask'
Rake::TestTask.new do |t|
  t.libs << pegasus_dir('test')
end
