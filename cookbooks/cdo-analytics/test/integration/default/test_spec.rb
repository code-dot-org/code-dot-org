describe package('libpq-dev') do
  it {should be_installed}
end

describe command('psql') do
  it {should exist}
end
