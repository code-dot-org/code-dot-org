import Applab from "./Applab";
import { AppOptions } from "./AppOptions";
import { Lab } from "./types";

export default function labFactory({ appType }: AppOptions): Lab {
  return new Applab()
}