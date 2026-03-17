import Checkbox from '@code-dot-org/component-library/checkbox';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {
  ProductTour,
  ProductTourConfig,
  ToursPerLab,
  UniversalLab2ProductTours,
} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {AppName} from '@cdo/apps/lab2/types';

interface EditProductTourSettingsProps {
  initialSettings: string[] | null;
  appName: string;
}

function getAvailableTours(appName: string): ProductTourConfig[] {
  const labTours = ToursPerLab[appName as AppName] ?? [];
  const universalTours = UniversalLab2ProductTours.filter(
    config => config.triggeredByLevel
  );
  return [...universalTours, ...labTours];
}

const EditProductTourSettings: React.FunctionComponent<
  EditProductTourSettingsProps
> = ({initialSettings, appName}) => {
  const [selectedTours, setSelectedTours] = useState<string[]>(
    initialSettings ?? []
  );

  const availableTours = getAvailableTours(appName);

  const handleTourToggle = (tour: ProductTour) => {
    setSelectedTours(prev =>
      prev.includes(tour) ? prev.filter(t => t !== tour) : [...prev, tour]
    );
  };

  return (
    <div>
      <Typography variant="body3" gutterBottom>
        Select which product tours will be triggered on this level. A user will
        only see the product tour if they have not seen it before on any level.
      </Typography>
      <input
        id="level_product_tour_settings"
        name={'level[product_tours]'}
        type="hidden"
        value={JSON.stringify(selectedTours)}
      />
      {availableTours.length === 0 ? (
        <Typography variant="body3">
          No level-triggered product tours are available for this lab.
        </Typography>
      ) : (
        availableTours.map(({name, displayName}) => (
          <Checkbox
            key={name}
            label={displayName}
            checked={selectedTours.includes(name)}
            onChange={() => handleTourToggle(name)}
            name={name}
          />
        ))
      )}
    </div>
  );
};

export default EditProductTourSettings;
