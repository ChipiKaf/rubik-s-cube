import { AmbientLight, Scene } from "three";
import Engine from "../Engine";

export default class Environment {
    private _engine: Engine;
    private _scene: Scene;
    ambientLight!: AmbientLight;
    constructor() {
        this._engine = new Engine();
        this._scene = this._engine.scene;
        this.setAmbientLight()
    }

    setAmbientLight() {
        this.ambientLight = new AmbientLight('white', 1)
        this._scene.add(this.ambientLight);
    }
}