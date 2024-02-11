import { Scene } from 'three';
import Engine from '../Engine';
import Resources from '../Utils/Resources';
import Environment from './Environment';
import Cube from './Cube';
export default class World {
    engine: Engine;
    scene: Scene;
    resources: Resources
    cube!: Cube;
    environment!: Environment;
    constructor() {
        this.engine = new Engine();
        this.resources = this.engine.resources;
        this.scene = this.engine.scene;
        this.resources.on('ready', () => {
            this.environment = new Environment();
            this.cube = new Cube();
        })
    }
}