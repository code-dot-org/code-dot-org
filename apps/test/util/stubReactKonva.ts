// konva ships ES modules only, which Jest cannot load. No apps test draws on
// a canvas, so the components the lesson deep dive package imports render nothing.
const Empty = () => null;

export const Image = Empty;
export const Label = Empty;
export const Layer = Empty;
export const Stage = Empty;
export const Tag = Empty;
export const Text = Empty;
export const Transformer = Empty;
