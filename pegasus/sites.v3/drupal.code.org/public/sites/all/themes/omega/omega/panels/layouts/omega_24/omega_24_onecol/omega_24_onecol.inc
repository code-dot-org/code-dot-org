<?php

/**
 * Implements hook_panels_layouts()
 */
function omega_omega_24_onecol_panels_layouts() {
  $items['omega_24_onecol'] = array(
    'title' => t('Single column 24'),
    'category' => t('Omega: 24 Column Grid'),
    'icon' => 'omega_24_onecol.png',
    'theme' => 'omega_24_onecol',
    'admin css' => '../omega_panels_admin_24.css',
    'regions' => array('middle' => t('Middle column')),
  );

  return $items;
}

