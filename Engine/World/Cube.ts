import { Group, Object3DEventMap, Scene } from "three";
import Engine from "../Engine";
import Resources from "../Utils/Resources";
import Time from "../Utils/Time";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export default class Cube {
    engine: Engine;
    scene: Scene;
    resources: Resources;
    time: Time;
    resource: GLTF;
    model!: Group<Object3DEventMap>
    constructor() {
        this.engine = new Engine();
        this.scene = this.engine.scene;
        this.resources = this.engine.resources;
        this.time = this.engine.time;
        this.resource = this.resources.items['rubiksCubeModel'] as GLTF
        this.setModel()
    }

    setModel() {
        this.model = this.resource.scene;
        this.scene.add(this.model);
    }
} 