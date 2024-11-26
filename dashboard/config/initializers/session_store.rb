require 'connection_pool'
require 'cdo/cookie_helpers'

session_cookie_key = environment_specific_cookie_name('_learn_session')
Dashboard::Application.config.session_store Middlewares::RedisSessionStore,
  key: session_cookie_key,
  servers: [CDO.session_store_server || 'redis://localhost:6379/0/session'],
  secure: !CDO.no_https_store && (!Rails.env.development? || CDO.https_development),
  domain: :all,

  # Users who interact with the site at least once a month will remain logged in.
  expire_after: 40.days,

  # At 4 connections per thread, up to 5 threads per worker, and 48 workers per
  # server, we expect 960 connections per server for each instance of this
  # session store. AWS enforces an absolute maximum of 65k connections per
  # cluster and we initialize more than one instance, so this number is our
  # primary bottleneck for being able to scale the session store.
  #
  # TODO infra: determine if this limit can be further reduced without
  # negatively impacting the performance of our web application servers.
  pool_size: 4,

  # In the interest of minimizing total connections per server and because the
  # secondary instance of the session store we initialize for Pegasus has lower
  # traffic than the one used by Dashboard, we specify a lower pool limit for
  # that instance; see lib/cdo/rack/request.rb for example usage.
  secondary_pool_size: 2
