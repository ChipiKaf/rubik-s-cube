import { Group, Mesh, Object3D, Object3DEventMap, Scene, Vector3 } from "three";
import Engine from "../Engine";
import Resources from "../Utils/Resources";
import Time from "../Utils/Time";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import EventEmitter from "../Helpers/Events/events";

export type Dimensions = { width: number; height: number; depth: number };
export type Position = { x: number; y: number; z: number };
export default class Cube {
  engine: Engine;
  scene: Scene;
  resources: Resources;
  time: Time;
  resource: GLTF;
  model!: Group<Object3DEventMap> | Mesh | Object3D;
  dimensions!: Dimensions;
  centerPiecePosition!: Position;

  constructor() {
    this.engine = new Engine();
    this.scene = this.engine.scene;
    this.resources = this.engine.resources;
    this.time = this.engine.time;
    this.resource = this.resources.items["rubiksCubeModel"] as GLTF;
    this.setModel();
    this.setCenterPiece();
  }

  setModel() {
    this.model = this.resource.scene;
    this.scene.add(this.model);
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
