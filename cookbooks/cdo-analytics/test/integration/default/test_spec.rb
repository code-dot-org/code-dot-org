describe package('libpq-dev') do
  it {should be_installed}
end

describe command('sql-runner') do
  it {should exist}
end

describe command('sql-runner -version') do
  its('stdout') {should eq "sql-runner version: 0.6.0\n"}
end

describe command('psql') do
  it {should exist}
end
