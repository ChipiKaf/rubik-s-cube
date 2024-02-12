import { Group, Mesh, Object3D, Object3DEventMap, Scene, Vector3 } from "three";
import Engine from "../Engine";
import Resources from "../Utils/Resources";
import Time from "../Utils/Time";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export type Dimensions = { width: number; height: number; depth: number };
export type Position = { x: number; y: number; z: number };
export default class Cube {
  private _engine: Engine;
  private _scene: Scene;
  private _resources: Resources;
  private _time: Time;
  private _resource: GLTF;
  model!: Group<Object3DEventMap> | Mesh | Object3D;
  dimensions!: Dimensions;
  centerPiecePosition!: Position;

  constructor() {
    this._engine = new Engine();
    this._scene = this._engine.scene;
    this._resources = this._engine.resources;
    this._time = this._engine.time;
    this._resource = this._resources.items["rubiksCubeModel"] as GLTF;
    this.setModel();
    this.setCenterPiece();
  }

  setModel() {
    this.model = this._resource.scene;
  }

  setCenterPiece() {
    this.model.traverse((child: any) => {
      if (child.name.toLowerCase() === "cube013") {
        const blockPiece = child;
        this.centerPiecePosition = {
          x: child.position.x,
          y: child.position.y,
          z: child.position.z,
        };
        blockPiece.geometry.computeBoundingBox();

        // The bounding box will give you the min and max coordinates of the geometry
        let bbox = blockPiece.geometry.boundingBox;
        // Calculate dimensions
        let width = bbox.max.x - bbox.min.x;
        let height = bbox.max.y - bbox.min.y;
        let depth = bbox.max.z - bbox.min.z;
        this.dimensions = { width, height, depth };
      }
    });
  }
}
