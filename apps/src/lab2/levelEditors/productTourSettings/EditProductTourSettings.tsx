import Checkbox from '@code-dot-org/component-library/checkbox';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {
  ProductTour,
  ToursPerLab,
} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {AppName} from '@cdo/apps/lab2/types';

import moduleStyles from './edit-predict-tour-settings.module.scss';

interface EditProductTourSettingsProps {
  initialSettings: string[] | null;
  appName: string;
}

const EditProductTourSettings: React.FunctionComponent<
  EditProductTourSettingsProps
> = ({initialSettings, appName}) => {
  const availableTours =
    ToursPerLab[appName as AppName]?.filter(tour => tour.triggeredByLevel) ??
    [];

  const availableTourNames = new Set(availableTours.map(tour => tour.name));
  const [selectedTours, setSelectedTours] = useState<string[]>(
    (initialSettings ?? []).filter(tourName =>
      availableTourNames.has(tourName as ProductTour)
    )
  );

  const handleTourToggle = (tour: ProductTour) => {
    setSelectedTours(prev =>
      prev.includes(tour) ? prev.filter(t => t !== tour) : [...prev, tour]
    );
  };

  if (availableTours.length === 0) {
    return (
      <Typography variant="body3">
        No level-triggered product tours are available for this lab.
      </Typography>
    );
  }

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
      {availableTours.map(({name, displayName, description}) => (
        <div key={name} className={moduleStyles.tourOption}>
          <Checkbox
            label={displayName}
            checked={selectedTours.includes(name)}
            onChange={() => handleTourToggle(name)}
            name={name}
          />
          {description && (
            <Typography
              variant="body3"
              className={moduleStyles.descriptionText}
            >
              {description}
            </Typography>
          )}
        </div>
      ))}
    </div>
  );
};

export default EditProductTourSettings;
