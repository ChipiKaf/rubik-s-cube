import * as THREE from "three";
import Sizes from "./Utils/Sizes";
import { Camera } from "./Camera";
import Renderer from "./Renderer";
import Time from "./Utils/Time";
import sources from './sources';
import Resources from './Utils/Resources';
import World from './World/World';
import Mouse from './Utils/Mouse';
import AxesHelper from './AxesHelper';
let instance: Engine | null = null;

export default class Engine {
  scene!: THREE.Scene;
  camera!: Camera;
  size!: Sizes;
  renderer!: Renderer;
  time!: Time;
  resources!: Resources;
  world!: World;
  mouse!: Mouse;
  AxesHelper!: AxesHelper;
  constructor(_slot?: Element | null) {
    if (instance) {
      return instance;
    }

    instance = this;

    this.size = new Sizes();

    this.time = new Time();

    this.renderer = new Renderer();

    if (!_slot) return;

    _slot.appendChild(this.renderer.instance.domElement);

    this.scene = new THREE.Scene();

    this.scene.background = new THREE.Color('white')
    
    this.camera = new Camera();

    this.resources = new Resources(sources);
    
    this.world = new World();
    
    this.mouse = new Mouse()
    
    this.AxesHelper = new AxesHelper()
    
    this.resize = this.resize.bind(this);

    this.update = this.update.bind(this);

    this.size.on("resize", this.resize);

    this.time.on("tick", this.update);
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.renderer.update();
    this.camera.update();
    this.mouse.update();
  }
}
