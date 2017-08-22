#!/bin/bash

LEVEL_TYPE='applab' node --max_old_space_size=4096 `npm bin`/grunt integrationTest