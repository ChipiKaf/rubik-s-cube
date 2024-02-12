import { Raycaster, Vector2, Vector3 } from "three";
import EventEmitter from "../Helpers/Events/events";
import Sizes from "./Sizes";
import Engine from "../Engine";
import { Camera } from "../Camera";
import Resources from "./Resources";
import Cube from "../World/Cube";

export type FaceRotation =             {
    face: 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back';
    x: number | null,
    y: number | null,
    z: number | null,
}
export default class Mouse extends EventEmitter {
    raycaster!: Raycaster;
    currentIntersect = null;
    position!: Vector2;
    private _size: Sizes
    private _engine: Engine;
    private _camera: Camera
    private _resources: Resources;
    private _cube!: Cube;
    private _objects: any[] = [];
    faceAndRotation: FaceRotation[] = [];
    currentFace!: FaceRotation | undefined;
    currentNormal!: 'x' | 'y' | 'z' | undefined;

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
            
            this.initializeFaceRotationObject()
            
            this._cube.model.traverse((child: any) => {
                if (child.name.length === 7) { // Not the best way to find the cubes, but the easiest
                    let worldPos = new Vector3();
                    child.getWorldPosition(worldPos);
                    this._objects.push(child);
                }
            })
        })


        window.addEventListener("mousemove", (event) => {
            const x = event.clientX / this._size.width * 2 - 1 // Will go from -1 to 1
            const y = -(event.clientY / this._size.height) * 2 + 1
            this.position.set(x, y);
        })
    }

    setRaycaster() {
        this.raycaster = new Raycaster()
    }

    update() {
        this.raycaster.setFromCamera(this.position, this._camera.instance);
        const intersects = this.raycaster.intersectObjects(this._objects);
        this.currentFace = undefined;
        this.currentNormal = undefined;
        if (intersects.length > 0) {
            let worldPos = new Vector3();
            intersects[0].object.getWorldPosition(worldPos);
            // console.log(worldPos);
    
            // Get the normal vector at the point of intersection
            const normal = intersects[0].face?.normal;
            
            if (!normal) return
            
            
            // Determine the major axis the normal vector is pointing towards
            const axisNormal = this.determineAxisNormal(normal);
            this.currentNormal = axisNormal;
            const faceObject = this.faceAndRotation.find((val) => val[axisNormal]?.toFixed(2) === worldPos[axisNormal].toFixed(2));
            if (!faceObject) return
            this.currentFace = faceObject
            // console.log(faceObject.face)
            this.highlightFace()

        }
    }

    highlightFace() {
        if (!this.currentNormal || !this.currentFace) return
        const objectsInFace = this._objects.filter((object) => {
            return object.position[this.currentNormal!].toFixed(2) === this.currentFace![this.currentNormal!]?.toFixed(2)
        })
        console.log(objectsInFace)
    }

    determineAxisNormal(normal: Vector3) {
        // Normalize the vector to ensure it has unit length
        normal.normalize();
    
        // Compare the absolute values of the x, y, and z components
        const absX = Math.abs(normal.x);
        const absY = Math.abs(normal.y);
        const absZ = Math.abs(normal.z);
    
        // Determine which component is closest to 1
        if (absX > absY && absX > absZ) return 'x';
        else if (absY > absX && absY > absZ) return 'y';
        else return 'z';
    }
    
    initializeFaceRotationObject() {
        this.faceAndRotation = [
            {
                face: 'top',
                x: null,
                y: this._cube.centerPiecePosition.y + this._cube.dimensions.height,
                z: null,
            },
            {
                face: 'bottom',
                x: null,
                y: this._cube.centerPiecePosition.y - this._cube.dimensions.height,
                z: null,
            },
            {
                face: 'front',
                x: null,
                y: null,
                z: this._cube.centerPiecePosition.z + this._cube.dimensions.height,
            },
            {
                face: 'back',
                x: null,
                y: null,
                z: this._cube.centerPiecePosition.z - this._cube.dimensions.height,
            },
            {
                face: 'right',
                x: this._cube.centerPiecePosition.x + this._cube.dimensions.height,
                y: null,
                z: null,
            },
            {
                face: 'left',
                x: this._cube.centerPiecePosition.x - this._cube.dimensions.height,
                y: null,
                z: null,
            }
        
        ]
    }
    
}