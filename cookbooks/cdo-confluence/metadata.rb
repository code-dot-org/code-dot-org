name             'cdo-confluence'
maintainer       'Code.org'
maintainer_email 'will@code.org'
license          'Apache 2.0'
description      'Installs/Configures Confluence'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          '0.0.1'

depends 'confluence'
depends 'chef_hostname'
