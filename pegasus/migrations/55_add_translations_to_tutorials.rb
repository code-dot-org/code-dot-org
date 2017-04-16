Sequel.migration do
  up do
    add_column :tutorials, :name_ro, String, null:false
    add_column :tutorials, :gradelevel_ro, String, null:false
    add_column :tutorials, :platformtext_ro, String, null:false
    add_column :tutorials, :shortdescription_ro, String, null:false
    add_column :tutorials, :longdescription_ro, Text, null:false
    add_column :tutorials, :name_pt, String, null:false
    add_column :tutorials, :gradelevel_pt, String, null:false
    add_column :tutorials, :platformtext_pt, String, null:false
    add_column :tutorials, :shortdescription_pt, String, null:false
    add_column :tutorials, :longdescription_pt, Text, null:false
    add_column :tutorials, :name_es, String, null:false
    add_column :tutorials, :gradelevel_es, String, null:false
    add_column :tutorials, :platformtext_es, String, null:false
    add_column :tutorials, :shortdescription_es, String, null:false
    add_column :tutorials, :longdescription_es, Text, null:false
    add_column :beyond_tutorials, :name_ro, String, null:false
    add_column :beyond_tutorials, :gradelevel_ro, String, null:false
    add_column :beyond_tutorials, :platformtext_ro, String, null:false
    add_column :beyond_tutorials, :shortdescription_ro, String, null:false
    add_column :beyond_tutorials, :longdescription_ro, Text, null:false
    add_column :beyond_tutorials, :name_pt, String, null:false
    add_column :beyond_tutorials, :gradelevel_pt, String, null:false
    add_column :beyond_tutorials, :platformtext_pt, String, null:false
    add_column :beyond_tutorials, :shortdescription_pt, String, null:false
    add_column :beyond_tutorials, :longdescription_pt, Text, null:false
    add_column :beyond_tutorials, :name_es, String, null:false
    add_column :beyond_tutorials, :gradelevel_es, String, null:false
    add_column :beyond_tutorials, :platformtext_es, String, null:false
    add_column :beyond_tutorials, :shortdescription_es, String, null:false
    add_column :beyond_tutorials, :longdescription_es, Text, null:false
  end

  down do
    drop_column :tutorials, :name_ro
    drop_column :tutorials, :gradelevel_ro
    drop_column :tutorials, :platformtext_ro
    drop_column :tutorials, :shortdescription_ro
    drop_column :tutorials, :longdescription_ro
    drop_column :tutorials, :name_pt
    drop_column :tutorials, :gradelevel_pt
    drop_column :tutorials, :platformtext_pt
    drop_column :tutorials, :shortdescription_pt
    drop_column :tutorials, :longdescription_pt
    drop_column :tutorials, :name_es
    drop_column :tutorials, :gradelevel_es
    drop_column :tutorials, :platformtext_es
    drop_column :tutorials, :shortdescription_es
    drop_column :tutorials, :longdescription_es
    drop_column :beyond_tutorials, :name_ro
    drop_column :beyond_tutorials, :gradelevel_ro
    drop_column :beyond_tutorials, :platformtext_ro
    drop_column :beyond_tutorials, :shortdescription_ro
    drop_column :beyond_tutorials, :longdescription_ro
    drop_column :beyond_tutorials, :name_pt
    drop_column :beyond_tutorials, :gradelevel_pt
    drop_column :beyond_tutorials, :platformtext_pt
    drop_column :beyond_tutorials, :shortdescription_pt
    drop_column :beyond_tutorials, :longdescription_pt
    drop_column :beyond_tutorials, :name_es
    drop_column :beyond_tutorials, :gradelevel_es
    drop_column :beyond_tutorials, :platformtext_es
    drop_column :beyond_tutorials, :shortdescription_es
    drop_column :beyond_tutorials, :longdescription_es
  end
end
