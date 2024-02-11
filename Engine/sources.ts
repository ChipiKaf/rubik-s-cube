export type SourceTypes = 'gltfModel' | 'texture' | 'cubeTexture';
export type Source = {
    name: string;
    type: SourceTypes;
    path: string;
}
export default [{
    name: 'rubiksCubeModel',
    type: 'gltfModel',
    path: 'models/rubiks-cube-3.glb',
}] as Source[]