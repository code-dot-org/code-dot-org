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
      <option value="bored">Bored</option>
    </select>
  ),
  colors: changeHandler => (
    <select
      name="colors"
      id={`${GENERATOR_DROPDOWNS_PREFIX}-colors`}
      onChange={changeHandler}
    >
      <option value="rainbow">rainbow</option>
      <option value="pink">pink</option>
      <option value="peach">peach</option>
      <option value="green">green</option>
      <option value="aqua">aqua</option>
      <option value="fuchsia">fuchsia</option>
      <option value="yellow">sunflower</option>
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
      <option value="platypus">Platypus</option>
      <option value="meerkat">Meerkat</option>
      <option value="chameleon">Chameleon</option>
      <option value="hedgehog">Hedgehog</option>
      <option value="dragon">Dragon</option>
      <option value="griffin">Griffin</option>
      <option value="dolphin">Dolphin</option>
      <option value="sloth">Sloth</option>
      <option value="axolotl">Axolotl</option>
    </select>
  ),
  number: changeHandler => (
    <select
      type="number"
      id={`${GENERATOR_DROPDOWNS_PREFIX}-number`}
      name="number"
      onChange={changeHandler}
    >
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
    </select>
  ),
  bodyParts: changeHandler => (
    <select
      name="bodyParts"
      id={`${GENERATOR_DROPDOWNS_PREFIX}-bodyParts`}
      onChange={changeHandler}
    >
      <option value="paws">Paws</option>
      <option value="wings">Wings</option>
      <option value="tail">Tail</option>
      <option value="beak">Beak</option>
      <option value="fins">Fins</option>
      <option value="antennae">Antennae</option>
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
      <option value="surreal">Surreal</option>
      <option value="minimalist">Minimalist</option>
      <option value="stained_glass">Stained Glass</option>
      <option value="watercolor">Watercolor</option>
      <option value="pointillist">Pointillist</option>
      <option value="popArt">Pop Art</option>
      <option value="graffiti">Graffiti</option>
      <option value="pixelArt">Pixel Art</option>
    </select>
  )
};
