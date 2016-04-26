actions :unpack
default_action :unpack

attribute :source, kind_of: String, name_attribute: true
attribute :root_dir, kind_of: String, required: true
attribute :mingw, kind_of: [TrueClass, FalseClass], default: false
attribute :checksum, kind_of: String
