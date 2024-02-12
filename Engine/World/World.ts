import { Scene } from "three";
import Engine from "../Engine";
import Resources from "../Utils/Resources";
import Environment from "./Environment";
import Cube from "./Cube";
export default class World {
  private _engine: Engine;
  private _scene: Scene;
  private _resources: Resources;
  public cube!: Cube;
  private _environment!: Environment;
  constructor() {
    this._engine = new Engine();
    this._resources = this._engine.resources;
    this._scene = this._engine.scene;
    this._resources.on("ready", () => {
      this._environment = new Environment();
      this.cube = new Cube();
      this._scene.add(this.cube.model)
    });
  }
}
