import * as THREE from "three";
import EventEmitter from "../Helpers/Events/events";
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Source } from "../sources";
export default class Resources extends EventEmitter {
    sources: Source[];
    items: { [key: string]: GLTF | THREE.Texture | THREE.CubeTexture};
    toLoad: number;
    loaded: number;
    loaders: {
        gltfLoader?: GLTFLoader;
        textureLoader?: THREE.TextureLoader;
        cubeTextureLoader?: THREE.CubeTextureLoader;
    } = {}
    constructor(sources: Source[]) {
        super()
        this.sources = sources;
        this.items = {}

        this.toLoad = this.sources.length;
        this.loaded = 0
        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        this.loaders.gltfLoader = new GLTFLoader();
        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
    }

    startLoading() {
        this.sources.forEach((source) => {
            if (source.type === 'gltfModel' && this.loaders.gltfLoader) {
                this.loaders.gltfLoader.load(source.path, (data) => {
                    this.loadSource(source, data)
                })
            }
            else if (source.type === 'texture' && this.loaders.textureLoader) {
                this.loaders.textureLoader.load(source.path, (data) => {
                    this.loadSource(source, data)
                })
            }
            else if (source.type === 'cubeTexture' && this.loaders.cubeTextureLoader) {
                this.loaders.cubeTextureLoader.load([source.path], (data) => {
                    this.loadSource(source, data)
                })
            }
            // Can add more
        })
    }

    loadSource(source: Source, data: GLTF | THREE.Texture | THREE.CubeTexture) {
        this.items[source.name] = data
        this.loaded++;

        if (this.loaded === this.toLoad) {
            this.emit('ready')
        }
    }
}