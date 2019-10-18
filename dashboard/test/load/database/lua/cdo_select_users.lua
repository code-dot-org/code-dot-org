#!/usr/bin/env sysbench

-- Called by sysbench one time to initialize this script
function thread_init()
 
  -- Create globals to be used elsewhere in the script
 
  -- drv - initialize the sysbench mysql driver
  drv = sysbench.sql.driver()
 
  -- con - represents the connection to MySQL
  con = drv:connect()
end
 
-- Called by sysbench when script is done executing
function thread_done()
  -- Disconnect/close connection to MySQL
  con:disconnect()
end
 

function event()
  -- TODO:(suresh) Run this on initialization of the thread.
  local max_user_level_id = 2098563437
  local max_user_id = 50826205
  local max_level_id = 17741
  local max_script_id = 405
  local max_level_source_id = 861968845
  
  -- TODO:(suresh) Declare these as local variables?  Switch to sb_rand_unique()?
  local user_id = sb_rand(1, max_user_level_id)
  local query = "SELECT * FROM dashboard_production.users WHERE deleted_at is null AND id = " .. user_id .. 
  " ORDER BY id ASC limit 1"
  con:query(query)
end
