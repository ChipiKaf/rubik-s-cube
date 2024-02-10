import * as THREE from "three";
import Engine from "./Engine";
import Sizes from "./Utils/Sizes";
import { Camera } from "./Camera";

export default class Renderer {
  public instance!: THREE.WebGLRenderer;
  private _engine: Engine;
  private _size: Sizes;
  private _scene: THREE.Scene;
  private _camera: Camera;
  constructor() {
    this._engine = new Engine();
    this._size = this._engine.size;
    this._scene = this._engine.scene;
    this._camera = this._engine.camera;
    this._setInstance();
  }

  private _setInstance() {
    this.instance = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.instance.setSize(this._size.width, this._size.height);
    this.instance.setPixelRatio(this._size.pixelRatio);
  }

  public resize() {
    this.instance.setSize(this._size.width, this._size.height);
    this.instance.setPixelRatio(this._size.pixelRatio);
  }

  public update() {
    this._camera = this._engine.camera;
    this._scene = this._engine.scene;
    this.instance.render(this._scene, this._camera.instance);
  }
}
