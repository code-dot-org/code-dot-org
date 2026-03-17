import React from 'react';

interface EditProductTourSettingsProps {
  initialSettings: object | null;
}

const EditProductTourSettings: React.FunctionComponent<
  EditProductTourSettingsProps
> = ({initialSettings: _initialSettings}) => {
  return (
    <div>
      <p>Product tour settings editor (coming soon)</p>
      <input
        id="level_product_tour_settings"
        name={'level[product_tours]'}
        type="hidden"
        value={JSON.stringify(null)}
      />
    </div>
  );
};

export default EditProductTourSettings;
