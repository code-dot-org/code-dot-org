var ArtistApi;

export const injectArtistAPI = function (artistApi) {
  ArtistApi = artistApi;
};

export const moveForward = function (distance) {
  ArtistApi.log.push(['FD', distance, null]);
};

export const moveBackward = function (distance) {
  ArtistApi.log.push(['FD', -distance, null]);
};

export const moveUp = function (distance) {
  ArtistApi.log.push(['MV', distance, 0, null]);
};

export const moveDown = function (distance) {
  ArtistApi.log.push(['MV', distance, 180, null]);
};

export const moveLeft = function (distance) {
  ArtistApi.log.push(['MV', distance, 270, null]);
};

export const moveRight = function (distance) {
  ArtistApi.log.push(['MV', distance, 90, null]);
};

export const moveUpRight = function (distance) {
  ArtistApi.log.push(['MD', distance, 45, null]);
};

export const moveDownRight = function (distance) {
  ArtistApi.log.push(['MD', distance, 135, null]);
};

export const moveDownLeft = function (distance) {
  ArtistApi.log.push(['MD', distance, 225, null]);
};

export const moveUpLeft = function (distance) {
  ArtistApi.log.push(['MD', distance, 315, null]);
};

export const jumpUp = function (distance) {
  ArtistApi.log.push(['JD', distance, 0, null]);
};

export const jumpDown = function (distance) {
  ArtistApi.log.push(['JD', distance, 180, null]);
};

export const jumpLeft = function (distance) {
  ArtistApi.log.push(['JD', distance, 270, null]);
};

export const jumpRight = function (distance) {
  ArtistApi.log.push(['JD', distance, 90, null]);
};

export const jumpUpRight = function (distance) {
  ArtistApi.log.push(['JD', distance, 45, null]);
};

export const jumpDownRight = function (distance) {
  ArtistApi.log.push(['JD', distance, 135, null]);
};

export const jumpDownLeft = function (distance) {
  ArtistApi.log.push(['JD', distance, 225, null]);
};

export const jumpUpLeft = function (distance) {
  ArtistApi.log.push(['JD', distance, 315, null]);
};

export const jumpForward = function (distance) {
  ArtistApi.log.push(['JF', distance, null]);
};

export const jumpBackward = function (distance) {
  ArtistApi.log.push(['JF', -distance, null]);
};

export const turnRight = function (angle) {
  ArtistApi.log.push(['RT', angle, null]);
};

export const turnLeft = function (angle) {
  ArtistApi.log.push(['RT', -angle, null]);
};

export const globalAlpha = function (alpha) {
  ArtistApi.log.push(['GA', alpha, null]);
};

export const penUp = function (id) {
  ArtistApi.log.push(['PU', null]);
};

export const penDown = function (id) {
  ArtistApi.log.push(['PD', null]);
};

export const penWidth = function (width) {
  ArtistApi.log.push(['PW', Math.max(width, 0), null]);
};

export const penColour = function (colour) {
  ArtistApi.log.push(['PC', colour, null]);
};

export const penPattern = function (pattern) {
  ArtistApi.log.push(['PS', pattern, null]);
};

export const hideTurtle = function (id) {
  ArtistApi.log.push(['HT', null]);
};

export const showTurtle = function (id) {
  ArtistApi.log.push(['ST', null]);
};

export const drawShape = function (sticker) {
  ArtistApi.log.push(['shape', sticker, null]);
};

export const drawSticker = function (sticker) {
  ArtistApi.log.push(['sticker', sticker, null]);
};

export const setArtist = function (artist) {
  ArtistApi.log.push(['setArtist', artist, null]);
};
