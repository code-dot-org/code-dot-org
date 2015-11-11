default['cdo-varnish'] = {
  'backends' => {
    'localhost' => '127.0.0.1',
  },
  'secret' => '00000000-0000-0000-0000-000000000000',
  'storage' => 'malloc,0.5G',
  redirects: {
    'forums.code.org'   => 'support.code.org',
    'aws.code.org'      => 'code.org',
    'blockly.com'       => 'studio.code.org',
    'learn.code.org'    => 'studio.code.org',
    'hourofcode.org'    => 'hourofcode.com',
    'hourofcode.co'     => 'hourofcode.com',
    'hourofcode.net'    => 'hourofcode.com',
    'hourofcode.co.uk'  => 'hourofcode.com',
    'hourofcode.org.uk' => 'hourofcode.com',
    'onehourofcode.com' => 'hourofcode.com',
    'onehourofcode.org' => 'hourofcode.com',
    'dayofcode.com'     => 'hourofcode.com',
    'dayofcode.org'     => 'hourofcode.com',
    'monthofcode.com'   => 'hourofcode.com',
    'weekofcode.org'    => 'hourofcode.com',
    'weekofcode.com'    => 'hourofcode.com',
    'yearofcode.co.uk'  => 'uk.code.org',
    'yearofcode.org.uk' => 'uk.code.org',
    'csedweek.com'        => 'csedweek.org',
    'csedweek.net'        => 'csedweek.org',
    'cseducationweek.com' => 'csedweek.org',
    'cseducationweek.org' => 'csedweek.org',
  },
  cookie_headers: {
    language_: 'X-Varnish-Accept-Language'
  }
}
