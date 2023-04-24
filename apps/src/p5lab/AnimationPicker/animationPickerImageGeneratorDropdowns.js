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
      <option value="#FFD700">Really Rainbow</option>
      <option value="#FFB6C1">Bunny Nose Pink</option>
      <option value="#FFC5A4">Peachy Keen</option>
      <option value="#00FF7F">Giggly Green</option>
      <option value="#7FFFD4">Happy Aqua</option>
      <option value="#FFD1DC">Frolicking Fuchsia</option>
      <option value="#FFCC00">Sunny Sunflower</option>
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
    <input
      type="number"
      id={`${GENERATOR_DROPDOWNS_PREFIX}-number`}
      name="number"
      min="1"
      max="4"
      value="2"
      onChange={changeHandler}
    ></input>
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
  )
};
