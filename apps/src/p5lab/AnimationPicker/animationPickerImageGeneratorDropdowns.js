export const GENERATOR_DROPDOWNS_PREFIX = 'imageGeneratorDropdowns';

export const select = {
  emotions: changeHandler => (
    <select
      name="emotions"
      id={`${GENERATOR_DROPDOWNS_PREFIX}-emotions`}
      onChange={changeHandler}
    >
      <option value="happy">Happy</option>
      <option value="sad">Sad</option>
      <option value="angry">Angry</option>
      <option value="excited">Excited</option>
      <option value="calm">Calm</option>
      <option value="anxious">Anxious</option>
      <option value="surprised">Surprised</option>
      <option value="silly">Silly</option>
    </select>
  ),
  colors: changeHandler => (
    <select
      name="colors"
      id={`${GENERATOR_DROPDOWNS_PREFIX}-colors`}
      onChange={changeHandler}
    >
      <option value="rainbow">Rainbow</option>
      <option value="red">Red</option>
      <option value="orange">Orange</option>
      <option value="yellow">Yellow</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
      <option value="purple">Purple</option>
      <option value="pink">Pink</option>
    </select>
  ),
  animals: changeHandler => (
    <select
      name="animals"
      id={`${GENERATOR_DROPDOWNS_PREFIX}-animals`}
      onChange={changeHandler}
    >
      <option value="unicorn">Unicorn</option>
      <option value="narwhal">Narwhal</option>
      <option value="panda">Panda</option>
      <option value="hedgehog">Hedgehog</option>
      <option value="dragon">Dragon</option>
      <option value="dolphin">Dolphin</option>
      <option value="axolotl">Axolotl</option>
      <option value="astronaut">Astronaut</option>
      <option value="dancer">Dancer</option>
    </select>
  )
};

export const stabilityAIStylePresets = (
  <>
    <option value="enhance">Enhance</option>
    <option value="anime">Anime</option>
    <option value="photographic">Photographic</option>
    <option value="digital-art">Digital Art</option>
    <option value="comic-book">Comic Book</option>
    <option value="fantasy-art">Fantasy Art</option>
    <option value="line-art">Line Art</option>
    <option value="analog-film">Analog Film</option>
    <option value="neon-punk">Neon Punk</option>
    <option value="isometric">Isometric</option>
    <option value="low-poly">Low Poly</option>
    <option value="origami">Origami</option>
    <option value="modeling-compound">Modeling Compound</option>
    <option value="cinematic">Cinematic</option>
    <option value="3d-model">3D Model</option>
    <option value="pixel-art">Pixel Art</option>
    <option value="tile-texture">Tile Texture</option>
  </>
);
