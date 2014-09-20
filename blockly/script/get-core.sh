#!/bin/bash

if [ $# -ne 1 ]; then
  echo 'Usage: get-core.sh <blockly-core-dir>' > /dev/stderr
  exit 1
fi

core_dir=$1
mooc_dir=.

function cp_msg_js() {
  src=$core_dir/msg/js/$1.js
  dest=$mooc_dir/lib/blockly/$2.js
  echo "$src => $dest"
  cp $src $dest
}

cp_msg_js de de_de
cp_msg_js en_us en_us
cp_msg_js es es_es
cp_msg_js fa fa_ir
cp_msg_js fr fr_fr
cp_msg_js hu hu_hu
cp_msg_js it it_it
cp_msg_js nl nl_nl
cp_msg_js pt_br pt_br
cp_msg_js ru ru_ru
cp_msg_js sv sv_se
cp_msg_js uk uk_ua
cp_msg_js vi vi_vn
cp_msg_js zh_cn zh_cn
cp_msg_js zh_tw zh_tw

# Just re-use English for Ploc for core (for now)
cp_msg_js en_us en_ploc
