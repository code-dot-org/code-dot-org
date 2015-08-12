# probably not needed in Rails 4.2

namespace :test do
  desc "Run tests in test/lib directory"
  Rake::TestTask.new(:lib) do |t|
    t.libs << "test"
    t.pattern = 'test/lib/**/*_test.rb'
  end

  desc "Run tests in test/dsl directory"
  Rake::TestTask.new(:dsl) do |t|
    t.libs << "test"
    t.pattern = 'test/dsl/**/*_test.rb'
  end

end

Rake::Task[:test].enhance do
  Rake::Task['test:lib'].invoke
  Rake::Task['test:dsl'].invoke
end
