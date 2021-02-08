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
