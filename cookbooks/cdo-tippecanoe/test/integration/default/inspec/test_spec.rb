def file_exist(file)
  describe file(file) do
    it {should exist}
  end
end

def cmd(exec, match)
  describe command(exec) do
    its(:stderr) {should match match}
  end
end

file_exist '/usr/local/bin/tippecanoe'
cmd 'tippecanoe -v', '1.34.3'
