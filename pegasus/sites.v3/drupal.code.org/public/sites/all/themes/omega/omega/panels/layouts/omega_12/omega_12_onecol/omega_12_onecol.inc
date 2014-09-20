<?php

/**
 * Implements hook_panels_layouts()
 */
function omega_omega_12_onecol_panels_layouts() {
  $items['omega_12_onecol'] = array(
    'title' => t('Single column 12'),
    'category' => t('Omega: 12 Column Grid'),
    'icon' => 'omega_12_onecol.png',
    'theme' => 'omega_12_onecol',
    'admin css' => '../omega_panels_admin_12.css',
    'regions' => array('middle' => t('Middle column')),
  );

  return $items;
}

