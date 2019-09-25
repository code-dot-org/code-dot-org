const sketch = p5 => {
  p5.setup = () => {
    p5.background(220);
  };

  p5.draw = () => {
    // console.log("draw!");
  };

  p5.setGoodCreature = () => {
    console.log("good");
  };

  p5.setBadCreature = () => {
    console.log("bad");
  };
};

export default sketch;
