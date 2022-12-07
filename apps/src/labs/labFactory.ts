import Applab from "./Applab";
import { App } from "./AppOptions";
import { Lab } from "./types";

export default function labFactory(appType: App): Lab {
  return new Applab()
}