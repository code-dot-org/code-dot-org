<?php

/**
 * Implements hook_panels_layouts()
 */
function omega_omega_16_onecol_panels_layouts() {
  $items['omega_16_onecol'] = array(
    'title' => t('Single column 16'),
    'category' => t('Omega: 16 Column Grid'),
    'icon' => 'omega_16_onecol.png',
    'theme' => 'omega_16_onecol',
    'admin css' => '../omega_panels_admin_16.css',
    'regions' => array('middle' => t('Middle column')),
  );

  return $items;
}

