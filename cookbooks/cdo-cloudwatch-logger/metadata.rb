name             'cdo-cloudwatch-logger'
maintainer       'Code.org'
maintainer_email 'will@code.org'
license          'All rights reserved'
description      'Installs/Configures cdo-cloudwatch-logger'
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          '0.1.10'

depends 'poise-service'
depends 'cdo-awscli'
depends 'sudo-user'
