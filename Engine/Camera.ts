import * as THREE from "three";
import Engine from "./Engine";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Sizes from "./Utils/Sizes";
import Renderer from "./Renderer";

export class Camera {
  public instance!: THREE.PerspectiveCamera;

  private _engine: Engine;

  private _size: Sizes;

  private _scene: THREE.Scene;

  private _controls!: OrbitControls;

  private _renderer: Renderer;

  constructor() {
    this._engine = new Engine();
    this._size = this._engine.size;
    this._scene = this._engine.scene;
    this._renderer = this._engine.renderer;
    this._setInstance();
    this._setControls();
  }

  private _setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      75,
      this._size.width / this._size.height,
      0.1,
      100
    );
    this.instance.position.set(6, 4, 8);
    this._scene.add(this.instance);
  }

  private _setControls() {
    this._controls = new OrbitControls(
      this.instance,
      this._renderer.instance.domElement
    );
    this._controls.enableDamping = true;
  }

  public resize () {
    this.instance.aspect = this._size.width / this._size.height;
    this.instance.updateProjectionMatrix();
  }

  public update () {
    this._controls.update();
  }
}
