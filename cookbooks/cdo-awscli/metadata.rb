name             'cdo-awscli'
maintainer       'Code.org'
maintainer_email 'dev@code.org'
license          'All rights reserved'
description      'Installs/Configures AWS command line interface'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          '0.1.13'

depends 'apt', '~> 2.6.0'
depends 'poise-python'
depends 'sudo-user'
