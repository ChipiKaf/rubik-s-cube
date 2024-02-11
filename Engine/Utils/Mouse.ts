import { Raycaster, Vector2 } from "three";
import EventEmitter from "../Helpers/Events/events";
import Sizes from "./Sizes";
import Engine from "../Engine";
import { Camera } from "../Camera";
import Resources from "./Resources";
import Cube from "../World/Cube";
export default class Mouse extends EventEmitter {
    raycaster!: Raycaster;
    currentIntersect = null;
    position!: Vector2;
    private _size: Sizes
    private _engine: Engine;
    private _camera: Camera
    private _resources: Resources;
    private _cube!: Cube;
    private _objects: any[] = [];;
    constructor() {
        super();
        this._engine = new Engine();
        this._size = this._engine.size;
        this.setRaycaster()
        this.position = new Vector2(-5,-5)
        this._camera = this._engine.camera;
        this._resources = this._engine.resources;
        this._resources.on('ready', () => {
            this._cube = this._engine.world.cube;
            this._cube.model.traverse((child: any) => {
                if ((child.isMesh || child.children[0]?.isMesh) && child.name.length === 7) {
                    this._objects.push(child)
                }
            })
        })


        window.addEventListener("mousemove", (event) => {
            const x = event.clientX / this._size.width * 2 - 1 // Will go from -1 to 1
            const y = -(event.clientY / this._size.height) * 2 + 1
            this.position.set(x, y);
            // console.log(`x position: ${this.x} y position: ${this.y}`);
        })
    }

    setRaycaster() {
        this.raycaster = new Raycaster()
    }

    update() {
        this.raycaster.setFromCamera(this.position, this._camera.instance)
        const intersects = this.raycaster.intersectObjects(this._objects)
        if (intersects.length > 0) console.log(intersects)
    }
}