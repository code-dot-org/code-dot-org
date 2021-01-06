export const commands = {
  async getPrediction(opts) {
    console.log('this is where the ML code will live!');
  }
};

export default function MLApi() {}

MLApi.getModelNames = function() {
  $.ajax({
    url: '/api/v1/ml_models/names',
    method: 'GET'
  }).done(function(data) {
    const names = data.map(model => model.name);
    return names;
  });
};
