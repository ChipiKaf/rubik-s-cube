import { Scene, AxesHelper as AH } from 'three';
import Engine from './Engine';
export default class AxesHelper {
    private _enging: Engine;
    private _scene: Scene;
    public instance!: AH;
    constructor() {
        this._enging = new Engine();
        this._scene = this._enging.scene;
        this.setInstance()
        this.disable()
    }

    setInstance() {
        this.instance = new AH(5);
        this._scene.add(this.instance);
        // this.instance.position.set(5, 5, 5)
    }

    enable() {
        this.instance.visible = true;
    }

    disable() {
        this.instance.visible = false;
    }
}