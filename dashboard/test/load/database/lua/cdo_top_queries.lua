#!/usr/bin/env sysbench

-- init/teardown code taken from: https://www.percona.com/blog/2019/04/25/creating-custom-sysbench-scripts/

-- Called by sysbench one time to initialize this script
function thread_init()
 
  -- Create globals to be used elsewhere in the script
 
  -- drv - initialize the sysbench mysql driver
  drv = sysbench.sql.driver()
 
  -- con - represents the connection to MySQL
  con = drv:connect()

  read_query_templates = {
    [[SELECT *
      FROM dashboard_production.users
      WHERE deleted_at is null
            AND id = $userId
      ORDER BY id ASC limit 1]],
    [[SELECT *
      FROM pegasus.user_storage_ids
      WHERE user_id = $userId limit 1]]
  }

  write_query_templates = {
    [[insert into dashboard_production.user_levels
      (`user_id`, `level_id`, `attempts`, `created_at`, `updated_at`, `best_result`, `script_id`, `level_source_id`, `submitted`)
       values ($userId, $levelId, 1, '$date', '$date', 11, $scriptId, $levelSourceId, 0)]],
    [[INSERT INTO dashboard_production.level_sources (`level_id`, `md5`, `data`, `created_at`, `updated_at`) VALUES ($levelId, '60c5580746e447bd0b9c4b6a7eb2a685', '$levelSourceData', '$date', '$date')]]
  }

  MAX_USER_LEVEL_ID = 2098563437
  MAX_USER_ID = 50826205
  MAX_LEVEL_ID = 17741
  MAX_SCRIPT_ID = 405
  MAX_LEVEL_SOURCE_ID = 861968845
  LEVEL_SOURCE_DATA = [[<xml><block type="craft_whenNight" deletable="false"><statement name="DO"><block type="craft_spawnEntity"><title name="TYPE">zombie</title><title name="DIRECTION">up</title></block></statement></block><block type="craft_zombieSpawnedTouchedClickedDay" deletable="false"><statement name="WHEN_SPAWNED"><block type="craft_wait"><title name="TYPE">0.4</title><next><block type="craft_spawnEntity"><title name="TYPE">zombie</title><title name="DIRECTION">up</title></block></next></block></statement><statement name="WHEN_TOUCHED"><block type="craft_wait"><title name="TYPE">2.0</title><next><block type="craft_attack"><next><block type="craft_moveToward"><title name="TYPE">Player</title></block></next></block></next></block></statement><statement name="WHEN_USED"><block type="craft_flashEntity"><next><block type="craft_destroyEntity"></block></next></block></statement><statement name="WHEN_DAY"><block type="craft_destroyEntity"></block></statement></block></xml>]]
end
 
-- Called by sysbench when script is done executing
function thread_done()
  -- Disconnect/close connection to MySQL
  con:disconnect()
end
 

function event()
  -- TODO:(suresh) Declare these as local variables?  Switch to sb_rand_unique()?
  
  local vars = {
    userId = sb_rand(1, MAX_USER_ID),
    levelId = sb_rand(1, MAX_USER_LEVEL_ID),
    scriptId = sb_rand(1, MAX_SCRIPT_ID),
    levelSourceId = sb_rand(1, MAX_LEVEL_SOURCE_ID),
    date = os.date("%Y-%m-%d %H:%M:%S", os.time()),
    levelSourceData = LEVEL_SOURCE_DATA
  }

  local query_templates = write_query_templates
  local random_template = query_templates[math.random(#query_templates)]
  -- Simple string interpolation from: https://hisham.hm/2016/01/04/string-interpolation-in-lua/
  -- "variable" names must be alphanumeric characters only.
  local query = string.gsub(random_template, "%$(%w+)", vars)

  con:query(query)
end
