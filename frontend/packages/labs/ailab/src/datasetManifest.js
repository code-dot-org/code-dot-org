export const allDatasets = [
  {
    id: "candy",
    name: "Erin's Candy Preferences - all binary",
    path: "datasets/erin_candy_preferences.csv",
    metadataPath: "datasets/erin_candy_preferences.json",
    imagePath: "datasets/erin_candy_preferences.jpg"
  },
  {
    id: "titanic",
    name: "Titanic - multiple datatypes",
    path: "datasets/titanic.csv",
    metadataPath: "datasets/titanic.json",
    imagePath: "datasets/titanic.jpg"
  },

  {
    id: "foods",
    name: "Foods",
    path: "datasets/foods.csv",
    metadataPath: "datasets/foods.json",
    imagePath: "datasets/foods.jpg"
  },
  {
    id: "flights",
    name: "Flight delays",
    path: "datasets/flight_delays.csv",
    metadataPath: "datasets/flight_delays.json",
    imagePath: "datasets/flight_delays.jpg"
  },
  {
    id: "videogames",
    name: "Videogame sales",
    path: "datasets/videogame_sales.csv",
    metadataPath: "datasets/videogame_sales.json",
    imagePath: "datasets/videogame_sales.jpg"
  },
  {
    id: "tacos_toy",
    name: "Tacos (Toy)",
    path: "datasets/taco_toppings_toy.csv",
    metadataPath: "datasets/taco_toppings_toy.json",
    imagePath: "datasets/taco_toppings_toy.jpg"
  },
  {
    id: "icecream_toy",
    name: "Ice Cream (Toy)",
    path: "datasets/icecream_toppings_toy.csv",
    metadataPath: "datasets/icecream_toppings_toy.json",
    imagePath: "datasets/icecream_toppings_toy.jpg"
  },
  {
    id: "pizza_toy",
    name: "Pizza (Toy)",
    path: "datasets/pizza_toppings_toy.csv",
    metadataPath: "datasets/pizza_toppings_toy.json",
    imagePath: "datasets/pizza_toppings_toy.jpg"
  },
  {
    id: "bike_sharing",
    name: "Bike Sharing",
    path: "datasets/bike_sharing.csv",
    metadataPath: "datasets/bike_sharing.json",
    imagePath: "datasets/temp.jpg"
  },
  {
    id: "billionaires",
    name: "Billionaires",
    path: "datasets/billionaires.csv",
    metadataPath: "datasets/billionaires.json",
    imagePath: "datasets/temp.jpg"
  },
  {
    id: "census_knn",
    name: "Full Census Data",
    path: "datasets/census_full_for_knn.csv",
    metadataPath: "datasets/census_full_for_knn.json",
    imagePath: "datasets/temp.jpg"
  },
  {
    id: "census_svm",
    name: "Partial Census Data",
    path: "datasets/census_part_for_svm.csv",
    metadataPath: "datasets/census_part_for_svm.json",
    imagePath: "datasets/temp.jpg"
  },
  {
    id: "happiness_contribution",
    name: "Global Happiness (contribution)",
    path: "datasets/global_happiness_contribution.csv",
    metadataPath: "datasets/global_happiness_contribution.json",
    imagePath: "datasets/temp.jpg"
  },
  {
    id: "happiness_raw",
    name: "Global Happiness (raw)",
    path: "datasets/global_happiness_raw.csv",
    metadataPath: "datasets/global_happiness_raw.json",
    imagePath: "datasets/temp.jpg"
  },
  {
    id: "land_temp",
    name: "Global Land Temperature",
    path: "datasets/global_land_temp_country_1995_2016.csv",
    metadataPath: "datasets/global_land_temp_country_1995_2016.json",
    imagePath: "datasets/temp.jpg"
  },
  {
    id: "housing",
    name: "Housing Prices",
    path: "datasets/housing_data.csv",
    metadataPath: "datasets/housing_data.json",
    imagePath: "datasets/temp.jpg"
  },
  {
    id: "insurance",
    name: "Insurance Data",
    path: "datasets/insurance_cost.csv",
    metadataPath: "datasets/insurance_cost.json",
    imagePath: "datasets/temp.jpg"
  },
  {
    id: "medical_priority",
    name: "Medical Priority (toy)",
    path: "datasets/medical_priority.csv",
    metadataPath: "datasets/medical_priority.json",
    imagePath: "datasets/temp.jpg"
  },
  {
    id: "pokemon",
    name: "Pokemon",
    path: "datasets/pokemon.csv",
    metadataPath: "datasets/pokemon.json",
    imagePath: "datasets/temp.jpg"
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
