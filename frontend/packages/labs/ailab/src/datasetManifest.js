export const allDatasets = [
  {
    id: "candy",
    name: "Erin's Candy Preferences - all binary",
    path: "datasets/erin_candy_preferences.csv",
    metadataPath: "datasets/erin_candy_preferences.json"
  },
  {
    id: "titanic",
    name: "Titanic - multiple datatypes",
    path: "datasets/titanic.csv",
    metadataPath: "datasets/titanic.json"
  },

  {
    id: "foods",
    name: "Foods",
    path: "datasets/foods.csv",
    metadataPath: "datasets/foods.json"
  },
  {
    id: "flights",
    name: "Flight delays",
    path: "datasets/flight_delays.csv",
    metadataPath: "datasets/flight_delays.json"
  },
  {
    id: "videogames",
    name: "Videogame sales",
    path: "datasets/videogame_sales.csv",
    metadataPath: "datasets/videogame_sales.json"
  }
];

export function getAvailableDatasets(specificDatasets) {
  if (specificDatasets && specificDatasets.length > 1) {
    return allDatasets.filter(dataset => {
      return specificDatasets.includes(dataset.id);
    });
  } else {
    return allDatasets;
  }
}

export function getDefaultLabelForDataset(datasetId) {
  return allDatasets.find(dataset => {
    return dataset.id === datasetId;
  });
}
