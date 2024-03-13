/* eslint-disable import/order */
export const getRandomDonorTwitter = function () {
  const donorOptions = ['@microsoft', '@facebook'];
  return donorOptions[Math.floor(Math.random() * donorOptions.length)];
};
