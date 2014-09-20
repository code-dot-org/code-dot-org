<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_12_threecol_4_4_4_panels_layouts() {
  $items['omega_12_threecol_4_4_4'] = array(
    'title' => t('Three column 4-4-4'),
    'category' => t('Omega: 12 Column Grid'),
    'icon' => 'omega_12_threecol_4_4_4.png',
    'theme' => 'omega_12_threecol_4_4_4',
    'admin css' => 'omega_12_threecol_4_4_4.css',
    'regions' => array(
      'left' => t('Left side'),
      'middle' => t('Middle column'),
      'right' => t('Right side')
    ),
  );

  return $items;
}
