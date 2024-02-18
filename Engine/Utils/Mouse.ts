import { Group, Matrix4, Mesh, Raycaster, Vector2, Vector3 } from "three";
import EventEmitter from "../Helpers/Events/events";
import Sizes from "./Sizes";
import Engine from "../Engine";
import { Camera } from "../Camera";
import Resources from "./Resources";
import Cube, { Position } from "../World/Cube";
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
  private _currentFaceObjects: {
    cube: Group | Mesh;
    originalPosition: {
      x: number;
      y: number;
      z: number;
      xRot: number;
      yRot: number;
      zRot: number;
    };
  }[] = [];
  private _firstEnter: number | null = null;
  private debounceTimer: number | null = null;
  private _changeFace: boolean | undefined = false;
  private _isRotating = false;
  private _rotationInProgress = false;
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
    window.addEventListener("mousedown", (event) => {
      if (this._currentFaceObjects.length > 0) this._isRotating = true;
    });
  }

  setRaycaster() {
    this.raycaster = new Raycaster();
  }

  update() {
    if (this._isRotating && !this._rotationInProgress) {
      this.rotateCubeAroundPoint();
    }
    if (this._rotationInProgress) return;

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
          gsap.to(object.cube.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.5, // Animation duration in seconds
          });
        });
        this._firstEnter = null;
        if (!this._isRotating) this._currentFaceObjects = [];
      }
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
          gsap.to(object.cube.scale, {
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
          cube: obj,
          originalPosition: {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z,
            xRot: obj.rotation.x,
            yRot: obj.rotation.y,
            zRot: obj.rotation.z,
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
    }

    this._lastCheckedTime = this._time.elapsed;
  }

  rotateCubeAroundPoint() {
    if (!this._currentFaceObjects) return;

    // Target rotation angle in radians
    const targetAngleRadians = 90 * (Math.PI / 180);
    // Center point of rotation
    var rotationGroup = new Group();
    let center = new Vector3(0, 0, 0);
    // Add each cube to the group
    this._currentFaceObjects.forEach((object) => {
      center.add(object.cube.position);
    })
    center.divideScalar(this._currentFaceObjects.length);
    this._currentFaceObjects.forEach((object) => {
      // Note: Consider adjusting the cube's position to the group's local space if necessary
      let adjustedPosition = object.cube.position.clone().sub(center);
      object.cube.position.copy(adjustedPosition);
      rotationGroup.add(object.cube);
    });

    // Add the rotation group to the scene
    rotationGroup.position.copy(center);
    this._engine.scene.add(rotationGroup);
    const rotationalAxis = this._getRotationalAxis()[0]
    console.log(rotationalAxis)

    gsap.to(rotationGroup.rotation, {
      // Assuming you're rotating around the Y-axis as an example
      [rotationalAxis]: targetAngleRadians,
      duration: 1,
      onUpdate: () => {
          this._rotationInProgress = true;
          // Since you're rotating the group, no need to update each cube individually here
      },
      onComplete: () => {
          // Re-parent the cubes back to the scene or their original parent, applying the group's rotation to them
          while (rotationGroup.children.length > 0) {
              let cube = rotationGroup.children[0];
              cube.applyMatrix4(rotationGroup.matrixWorld);
              this._engine.scene.add(cube); // Or add back to their original parent if necessary
          }
  
          this._engine.scene.remove(rotationGroup); // Clean up the temporary group
  
          this._currentFaceObjects = this._currentFaceObjects.map((obj) => {
              return {
                  ...obj,
                  originalPosition: {
                      x: obj.cube.position.x,
                      y: obj.cube.position.y,
                      z: obj.cube.position.z,
                      xRot: obj.cube.rotation.x,
                      yRot: obj.cube.rotation.y,
                      zRot: obj.cube.rotation.z
                  },
              };
          });
  
          console.log(this._currentFaceObjects);
          this.snapToPosition()
          this._isRotating = false;
          this._rotationInProgress = false;
          if (!this._firstEnter && this._currentFaceObjects.length > 0)
              this._currentFaceObjects = [];
          // Reset or update state as necessary
      },
  });
  }

  private snapToPosition() {
    const possiblePositionsX = [
      this._cube.centerPiecePosition.x,
      this._cube.centerPiecePosition.x + this._cube.dimensions.width,
      this._cube.centerPiecePosition.x - this._cube.dimensions.width,
    ];

    const possiblePositionsY = [
      this._cube.centerPiecePosition.y,
      this._cube.centerPiecePosition.y + this._cube.dimensions.width,
      this._cube.centerPiecePosition.y - this._cube.dimensions.width,
    ];

    const possiblePositionsZ = [
      this._cube.centerPiecePosition.z,
      this._cube.centerPiecePosition.z + this._cube.dimensions.width,
      this._cube.centerPiecePosition.z - this._cube.dimensions.width,
    ];
    this._currentFaceObjects.forEach((object) => {
      // Snap X axis
      object.cube.position.x = this.snapValueToClosest(
        object.cube.position.x,
        possiblePositionsX
      );

      // Assuming similar possible positions for y and z axis, adjust as needed
      object.cube.position.y = this.snapValueToClosest(
        object.cube.position.y,
        possiblePositionsY
      );
      object.cube.position.z = this.snapValueToClosest(
        object.cube.position.z,
        possiblePositionsZ
      );
    });
  }

  private snapValueToClosest(value: number, possibleValues: number[]): number {
    // Calculate the difference between the value and each possible position
    let closest = possibleValues.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );

    return closest;
  }

  private _getPositionalAxes(): ("x" | "y" | "z")[] {
    if (
      this.currentFace?.face === "front" ||
      this.currentFace?.face === "back"
    ) {
      return ["x", "y"];
    } else if (
      this.currentFace?.face === "left" ||
      this.currentFace?.face === "right"
    ) {
      return ["y", "z"];
    } else if (
      this.currentFace?.face === "top" ||
      this.currentFace?.face === "bottom"
    ) {
      return ["x", "z"];
    } else {
      return ["x", "y", "z"];
    }
  }

  private _getRotationalAxis(): ["x" | "y" | "z", "xRot" | "yRot" | "zRot"] {
    if (
      this.currentFace?.face === "front" ||
      this.currentFace?.face === "back"
    ) {
      return ["z", "zRot"];
    } else if (
      this.currentFace?.face === "left" ||
      this.currentFace?.face === "right"
    ) {
      return ["x", "xRot"];
    } else if (
      this.currentFace?.face === "top" ||
      this.currentFace?.face === "bottom"
    ) {
      return ["y", "yRot"];
    } else {
      return ["z", "zRot"];
    }
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
