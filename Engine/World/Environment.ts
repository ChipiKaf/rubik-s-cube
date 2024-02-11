import { AmbientLight, Scene } from "three";
import Engine from "../Engine";

export default class Environment {
    engine: Engine;
    scene: Scene;
    ambientLight!: AmbientLight;
    constructor() {
        this.engine = new Engine();
        this.scene = this.engine.scene;
        this.setAmbientLight()
    }

    setAmbientLight() {
        this.ambientLight = new AmbientLight('white', 1)
        this.scene.add(this.ambientLight);
    }
}