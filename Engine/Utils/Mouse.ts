import { Group, Matrix4, Raycaster, Vector2, Vector3 } from "three";
import EventEmitter from "../Helpers/Events/events";
import Sizes from "./Sizes";
import Engine from "../Engine";
import { Camera } from "../Camera";
import Resources from "./Resources";
import Cube from "../World/Cube";
import Time from "./Time";
import { gsap } from "gsap";

export type FaceRotation = {
  face: "top" | "bottom" | "left" | "right" | "front" | "back";
  x: number | null;
  y: number | null;
  z: number | null;
};
export default class Mouse extends EventEmitter {
  raycaster!: Raycaster;
  currentIntersect = null;
  position!: Vector2;
  private _size: Sizes;
  private _engine: Engine;
  private _camera: Camera;
  private _resources: Resources;
  private _time: Time;
  private _lastCheckedTime: number;
  private _cube!: Cube;
  private _objects: any[] = [];
  private _currentFaceObjects: any[] = [];
  private _firstEnter: number | null = null;
  private debounceTimer: number | null = null;
  private _changeFace: boolean | undefined = false;
  private _rotated = false;
  faceAndRotation: FaceRotation[] = [];
  currentFace!: FaceRotation | undefined;
  currentNormal!: "x" | "y" | "z" | undefined;

  constructor() {
    super();
    this._engine = new Engine();
    this._size = this._engine.size;
    this.setRaycaster();
    this._time = this._engine.time;
    this._lastCheckedTime = this._time.elapsed;
    this.position = new Vector2(-5, -5);
    this._camera = this._engine.camera;
    this._resources = this._engine.resources;
    this._resources.on("ready", () => {
      this._cube = this._engine.world.cube;

      this.initializeFaceRotationObject();

      this._cube.model.traverse((child: any) => {
        if (child.name.length === 7 || child.name.length === 4) {
          // Not the best way to find the cubes, but the easiest
          let worldPos = new Vector3();
          child.getWorldPosition(worldPos);
          this._objects.push(child);
        }
      });
    });

    window.addEventListener("mousemove", (event) => {
      const x = (event.clientX / this._size.width) * 2 - 1; // Will go from -1 to 1
      const y = -(event.clientY / this._size.height) * 2 + 1;
      this.position.set(x, y);
    });
  }

  setRaycaster() {
    this.raycaster = new Raycaster();
  }

  update() {
    this.raycaster.setFromCamera(this.position, this._camera.instance);
    const intersects = this.raycaster.intersectObjects(this._objects);
    this.currentFace = undefined;
    // this.currentNormal = undefined;
    if (intersects.length > 0) {
      let worldPos = new Vector3();
      intersects[0].object.getWorldPosition(worldPos);

      // Get the normal vector at the point of intersection
      const normal = intersects[0].face?.normal;

      if (!normal) return;

      // Determine the major axis the normal vector is pointing towards
      const axisNormal = this.determineAxisNormal(normal);
      if (!this._changeFace)
        this._changeFace =
          this.currentNormal && this.currentNormal !== axisNormal;
      this.currentNormal = axisNormal;
      const faceObject = this.faceAndRotation.find(
        (val) => val[axisNormal]?.toFixed(2) === worldPos[axisNormal].toFixed(2)
      );
      if (!faceObject) return;
      this.currentFace = faceObject;

      this.highlightFace(this._changeFace);
    } else {
      if (this._firstEnter) {
        this._currentFaceObjects.forEach((object) => {
          gsap.to(object.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.5, // Animation duration in seconds
          });
        });
        this._firstEnter = null;
        this._currentFaceObjects = [];
      }
      this._rotated = false;
    }
  }

  highlightFace(changeFace: boolean = false) {
    if (!this.currentNormal || !this.currentFace) return;

    if (this._time.elapsed - this._lastCheckedTime < 300) return;

    const objectsInFace = this._objects.filter((object) => {
      return (
        object.position[this.currentNormal!].toFixed(2) ===
        this.currentFace![this.currentNormal!]?.toFixed(2)
      );
    });

    // Using GSAP to animate the scaling
    if (!this._firstEnter || changeFace) {
      // Reset scale of previously highlighted objects, if any
      if (this._currentFaceObjects) {
        this._currentFaceObjects.forEach((object) => {
          gsap.to(object.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.5, // Animation duration in seconds
          });
        });
      }

      // Apply new scale to the current face objects using GSAP
      this._currentFaceObjects = objectsInFace.map((obj) => {
        return {
          ...obj,
          originalPosition: {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z,
          },
        };
      });
      objectsInFace.forEach((object) => {
        gsap.to(object.scale, {
          x: 1.05,
          y: 1.05,
          z: 1.05,
          duration: 0.5, // Adjust duration as needed
        });
      });

      this._firstEnter = 1;
      if (changeFace) {
        this._changeFace = false;
      }
      if (!this._rotated) this.rotateCubeAroundPoint();
      this._rotated = false;
    }

    this._lastCheckedTime = this._time.elapsed;
  }

  rotateCubeAroundPoint() {
    if (!this._currentFaceObjects) return;

    // Target rotation angle in radians
    const targetAngleRadians = 90 * (Math.PI / 180);
    // Center point of rotation
    const center = this._cube.centerPiecePosition;

    // This object will be animated by GSAP. Its changing `angle` drives the rotation.
    // Initialize or update rotationParams before starting GSAP animation
    let rotationParams = { angle: 0 };

    gsap.to(rotationParams, {
      angle: targetAngleRadians,
      duration: 1,
      onUpdate: () => {
        this._currentFaceObjects.forEach((cube) => {
          // Assuming originalPosition is accurately stored
          let relativeX = cube.originalPosition.x - center.x;
          let relativeY = cube.originalPosition.y - center.y;

          // Calculate new position based on the current angle
          let newX =
            relativeX * Math.cos(rotationParams.angle) -
            relativeY * Math.sin(rotationParams.angle);
          let newY =
            relativeX * Math.sin(rotationParams.angle) +
            relativeY * Math.cos(rotationParams.angle);

          // Update cube's position without altering its rotation
          cube.position.set(newX + center.x, newY + center.y, cube.position.z);
        });
      },
      onComplete: () => {
        console.log("Rotation complete");
        // Reset or update state as necessary
      },
    });
  }

  determineAxisNormal(normal: Vector3) {
    // Normalize the vector to ensure it has unit length
    normal.normalize();

    // Compare the absolute values of the x, y, and z components
    const absX = Math.abs(normal.x);
    const absY = Math.abs(normal.y);
    const absZ = Math.abs(normal.z);

    // Determine which component is closest to 1
    if (absX > absY && absX > absZ) return "x";
    else if (absY > absX && absY > absZ) return "y";
    else return "z";
  }

  initializeFaceRotationObject() {
    this.faceAndRotation = [
      {
        face: "top",
        x: null,
        y: this._cube.centerPiecePosition.y + this._cube.dimensions.height,
        z: null,
      },
      {
        face: "bottom",
        x: null,
        y: this._cube.centerPiecePosition.y - this._cube.dimensions.height,
        z: null,
      },
      {
        face: "front",
        x: null,
        y: null,
        z: this._cube.centerPiecePosition.z + this._cube.dimensions.height,
      },
      {
        face: "back",
        x: null,
        y: null,
        z: this._cube.centerPiecePosition.z - this._cube.dimensions.height,
      },
      {
        face: "right",
        x: this._cube.centerPiecePosition.x + this._cube.dimensions.height,
        y: null,
        z: null,
      },
      {
        face: "left",
        x: this._cube.centerPiecePosition.x - this._cube.dimensions.height,
        y: null,
        z: null,
      },
    ];
  }
}
