Rake::Task['db:test:prepare'].enhance do
  Rake::Task['seed:test'].invoke
end
