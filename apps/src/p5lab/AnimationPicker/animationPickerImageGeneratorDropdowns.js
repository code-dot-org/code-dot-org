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
  ),
  artisticStyles: changeHandler => (
    <select
      name="artisticStyles"
      id={`${GENERATOR_DROPDOWNS_PREFIX}-artisticStyles`}
      onChange={changeHandler}
    >
      <option value="realistic">Realistic</option>
      <option value="cartoon">Cartoon</option>
      <option value="abstract">Abstract</option>
      <option value="watercolor">Watercolor</option>
      <option value="graffiti">Graffiti</option>
      <option value="pixelArt">Pixel Art</option>
      <option value="sketch">Sketch</option>
      <option value="robot">Robot</option>
    </select>
  )
};
