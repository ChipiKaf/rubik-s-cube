"use strict";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
const mathingFunction = (val) => {
  return val >= 0 ? Math.floor(val) : Math.ceil(val)
}
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(4, 4, 5); // Adjust these values as needed
camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the center of the scene (or the center of the Rubik's Cube)

// camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.querySelector("#app").appendChild(renderer.domElement);

const cubeSize = 1; // Size of each small cube
const gap = 0.025; // Gap between each cube
const offset = (cubeSize + gap) * 1.5; // Offset to center the Rubik's Cube

// Define the colors for each face
const faceColors = [
  new THREE.MeshBasicMaterial({ color: 0xbbbbbb }), // Light Grey (Darker White)
  new THREE.MeshBasicMaterial({ color: 0x0000cc }), // Darker Blue
  new THREE.MeshBasicMaterial({ color: 0xbb0000 }), // Darker Red
  new THREE.MeshBasicMaterial({ color: 0x00bb00 }), // Darker Green
  new THREE.MeshBasicMaterial({ color: 0xbbbb00 }), // Gold (Darker Yellow)
  new THREE.MeshBasicMaterial({ color: 0xcc7400 }), // Darker Orange
];

const brightFaceColors = [
  new THREE.MeshBasicMaterial({ color: 0xffffff }), // Light Grey (Darker White)
  new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Darker Blue
  new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Darker Red
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Darker Green
  new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Gold (Darker Yellow)
  new THREE.MeshBasicMaterial({ color: 0xff7400 }), // Darker Orange
];

const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
// const groups = {
//   left: new THREE.Group(),
//   right: new THREE.Group(),
//   top: new THREE.Group(),
//   bottom: new THREE.Group(),
//   front: new THREE.Group(),
//   back: new THREE.Group()
// };
// for (const groupName in groups) {
//   const group = groups[groupName]
//   group.name = groupName;
//   scene.add(group);
// }
let left = 0
let right
// Create 3x3x3 Rubik's Cube
// Create 3x3x3 Rubik's Cube
for (let x = 0; x < 3; x++) {
  for (let y = 0; y < 3; y++) {
    for (let z = 0; z < 3; z++) {
      const cubeMaterial = [
        faceColors[0], // Right face
        faceColors[1], // Left face
        faceColors[2], // Top face
        faceColors[3], // Bottom face
        faceColors[4], // Front face
        faceColors[5], // Back face
      ];
      const smallCube = new THREE.Mesh(geometry, cubeMaterial);

      // Determine the faces the cube belongs to and their locations
      let faces = [];
      let locations = [];

      if (x === 0) {
        // groups.left.add(smallCube);
        faces.push("left");
        locations.push(determineLocation(y, z, "left"));
      }
      if (x === 2) {
        // groups.right.add(smallCube);
        faces.push("right");
        locations.push(determineLocation(y, z, "right"));
      }
      if (y === 0) {
        // groups.bottom.add(smallCube);
        faces.push("bottom");
        locations.push(determineLocation(x, z, "bottom"));
      }
      if (y === 2) {
        // groups.top.add(smallCube);
        faces.push("top");
        locations.push(determineLocation(x, z, "top"));
      }
      if (z === 0) {
        // groups.back.add(smallCube);
        faces.push("back");
        locations.push(determineLocation(x, y, "back"));
      }
      if (z === 2) {
        // groups.front.add(smallCube);
        faces.push("front");
        locations.push(determineLocation(x, y, "front"));
      }

      smallCube.userData = {
        position: {
          x: (x - 1) * (cubeSize + gap),
          y: (y - 1) * (cubeSize + gap),
          z: (z - 1) * (cubeSize + gap),
        },
        originalMaterial: cubeMaterial,
        faces: faces,
        locations: locations,
      };
      smallCube.position.set(
        (x - 1) * (cubeSize + gap),
        (y - 1) * (cubeSize + gap),
        (z - 1) * (cubeSize + gap)
      );
      // console.log(`Left: ${groups.left.children.length}`)

      scene.add(smallCube);
    }
  }
}

const controls = new OrbitControls(camera, renderer.domElement);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cameraButton").addEventListener("click", () => {
    if (controls.enabled) {
      controls.enabled = false;
    } else controls.enabled = true;
  });

  // Events

  // Raycaster and mouse vector
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Convert mouse position to Three.js coordinates and update raycaster
  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      const intersectedCube = intersects[0].object;
      const normal = intersects[0].face.normal;
      // console.log(intersectedCube);
      // console.log(normal)
      highlightLine(intersectedCube, normal);
    } else {
      scene.children.forEach(resetHighlight);
    }
  }

  // Updated highlightLine function
  function highlightLine(intersectedCube, normal) {
    const intersectedUserData = { ...intersectedCube.userData };
    // console.log(normal);
    // console.log(intersectedUserData.position);
    const topPos = cubeSize + gap;
    const { x, y, z } = intersectedUserData.position;
    scene.children.forEach((child) => {
      if (child.userData && child.userData.position) {
        resetHighlight(child);
        if (
          intersectedUserData.faces.includes("front") &&
          child.userData.faces.includes("front") &&
          normal.z === 1
        ) {
          applyHighlight(child);
        } else if (
          intersectedUserData.faces.includes("right") &&
          child.userData.faces.includes("right") &&
          normal.x === 1
        )
          applyHighlight(child);
        else if (
          intersectedUserData.faces.includes("top") &&
          child.userData.faces.includes("top") &&
          normal.y === 1
        )
          applyHighlight(child);
        else if (
          intersectedUserData.faces.includes("left") &&
          child.userData.faces.includes("left") &&
          normal.x === -1
        )
          applyHighlight(child);
        else if (
          intersectedUserData.faces.includes("bottom") &&
          child.userData.faces.includes("bottom") &&
          normal.y === -1
        )
          applyHighlight(child);
          else if (
            intersectedUserData.faces.includes("back") &&
            child.userData.faces.includes("back") &&
            normal.z === -1
          )
            applyHighlight(child);
        // Determine which cubes to highlight
        // if (normal.x !== 0 && child.userData.position.x === position.x) {
        //   applyHighlight(child);
        // } else if (normal.y !== 0 && child.userData.position.y === position.y) {
        //   applyHighlight(child);
        // } else if (normal.z !== 0 && child.userData.position.z === position.z) {
        //   applyHighlight(child);
        // }
      }
    });
  }


  function applyHighlight(cube) {
    // Change the cube's material or color to highlight it
    const cubeMaterial = [
      brightFaceColors[0], // Right face
      brightFaceColors[1], // Left face
      brightFaceColors[2], // Top face
      brightFaceColors[3], // Bottom face
      brightFaceColors[4], // Front face
      brightFaceColors[5], // Back face
    ];
    cube.material = cubeMaterial;
  }

  function resetHighlight(cube) {
    if (cube.userData && cube.userData.originalMaterial) {
      cube.material = cube.userData.originalMaterial;
    }
  }

  document.addEventListener("mousemove", onMouseMove);

  //
});

controls.enableDamping = true; // Optional, but can provide a smoother control feel
controls.dampingFactor = 0.05;

function getCorrectXPositioner(face) {
  if (face === "front" || face === "left" || face === "top")
    return ["left", "center", "right"];
  else return ["right", "center", "left"];
}
function getCorrectYPositioner(face) {
  if (face === "bottom" || face === "top") return ["top-", "", "bottom-"];
  else return ["bottom-", "", "top-"];
}
function convertToPositioner(coord1, coord2, face) {
  if (face === "left" || face === "right")
    return { yPos: coord1, xPos: coord2 };
  else return { yPos: coord2, xPos: coord1 };
}
// Function to determine location on a face based on coordinates
function determineLocation(coord1, coord2, face = "none") {
console.log("Before edit") 
console.log(`coord1: ${coord1}, corrd2: ${coord2}, face: ${face}`)

  coord1 = mathingFunction(coord1);
  coord2 = mathingFunction(coord2);
  console.log(`coord1: ${coord1}, corrd2: ${coord2}, face: ${face}`)
  const positioner = convertToPositioner(coord1, coord2, face);
  const yAxisPositioner = getCorrectYPositioner(face);
  const yName = yAxisPositioner[positioner.yPos];
  const xAxisPositioner = getCorrectXPositioner(face);
  const xName = xAxisPositioner[positioner.xPos];
  console.log(`${yName}${xName}`)
  return `${yName}${xName}`;
}
function rotateFace(faceCubes, axis, angleDelta) {
  // Calculate the center of the face
  let center = new THREE.Vector3(0, 0, 0);
  faceCubes.forEach(cube => {
    center.add(cube.position);
  });
  center.divideScalar(faceCubes.length);

  // Rotate around the center
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(...(axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1])), angleDelta);

  faceCubes.forEach(cube => {
    // Translate cube to the rotation origin (center of face)
    cube.position.sub(center);

    // Apply rotation
    cube.position.applyQuaternion(quaternion);
    cube.rotation.setFromQuaternion(cube.quaternion.multiply(quaternion));

    // Translate cube back
    cube.position.add(center);
  });
}
let isRotating = false


// Assuming raycaster and mouse are already defined
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let faceClicked;
let facesOfClicked
let normalDirection;

function onMouseClick(event) {
  // Convert the mouse position to normalized device coordinates (NDC)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    // The first intersected object is the one closest to the camera
    const intersectedCube = intersects[0].object;
    facesOfClicked = intersectedCube.userData.faces
    const normal = intersects[0].face.normal;
    if (normal.x !== 0) {
      normalDirection = 'x';
  } else if (normal.y !== 0) {
      normalDirection = 'y';
  } else if (normal.z !== 0) {
      normalDirection = 'z';
  }
    // Here you can determine which face is clicked
    // For example, based on the intersected cube's position or userData
    // console.log("Clicked on cube:", intersectedCube);
    isRotating = true
    // ... additional logic to determine and handle the clicked face ...
  }
}

document.addEventListener('click', onMouseClick);


let faceCubes;
let faceChosen;
let i = 0;
let cumulativeRotation = 0;
const rotationPerFrame = (Math.PI / 2) / 50; // 90 degrees divided into 50 frames
const restoreCoordinates = (value) => {
  return Math.round(((value) / (cubeSize + gap)) + 1)
}
const addGap = (val) => {
  if (val > 0) return val + gap;
  else if (val < 0) return val - gap;
  else return val
}
function animate() {
  requestAnimationFrame(animate);
  // const frontFaceCubes = scene.children.filter((val) => val.userData && val.userData.faces.includes('top'))
  if (isRotating) {
    if (normalDirection === 'x' && facesOfClicked.includes('left')) faceChosen = 'left'  
    else if (normalDirection === 'x' && facesOfClicked.includes('right')) faceChosen = 'right'
    else if (normalDirection === 'y' && facesOfClicked.includes('top')) faceChosen = 'top'  
    else if (normalDirection === 'y' && facesOfClicked.includes('bottom')) faceChosen = 'bottom'
    else if (normalDirection === 'z' && facesOfClicked.includes('front')) faceChosen = 'front'
    else if (normalDirection === 'z' && facesOfClicked.includes('back')) faceChosen = 'back'  

    faceCubes = scene.children.filter((val) => val.userData && val.userData.faces.includes(faceChosen))
    
    rotateFace(faceCubes, normalDirection, rotationPerFrame);
    cumulativeRotation += rotationPerFrame;
    if (cumulativeRotation >= Math.PI / 2) {
      isRotating = false;
      cumulativeRotation = 0; // Reset for the next rotation
      faceCubes.forEach((cube) => {
        cube.userData.position = { x: addGap(Math.round(cube.position.x)), y: addGap(Math.round(cube.position.y)), z: addGap(Math.round(cube.position.z)) };
        console.log(`new positions`, cube.userData.position)
        let { x, y, z } = cube.userData.position;
        const x2 = restoreCoordinates(x)
        const y2 = restoreCoordinates(y)
        const z2 = restoreCoordinates(z)
        
        // // x = mathingFunction(x)
        // // y = mathingFunction(y)
        // // z = mathingFunction(z)
        const faces = [];
        const locations = []

        if (x2 === 0) {
          faces.push("left");
          locations.push(determineLocation(y2, z2, "left"));
        }
        if (x2 === 2) {
          faces.push("right");
          locations.push(determineLocation(y2, z2, "right"));
        }
        if (y2 === 0) {
          faces.push("bottom");
          locations.push(determineLocation(x2, z2, "bottom"));
        }
        if (y2 === 2) {
          faces.push("top");
          locations.push(determineLocation(x2, z2, "top"));
        }
        if (z2 === 0) {
          faces.push("back");
          locations.push(determineLocation(x2, y2, "back"));
        }
        if (z2 === 2) {
          faces.push("front");
          locations.push(determineLocation(x2, y2, "front"));
        }
        cube.userData = { ...cube.userData, locations, faces}
        console.log(cube.userData);
      })

      // console.log("Position of first cube:", cube.position);


    }
  }
  // Required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  renderer.render(scene, camera);
}

// Events

//

animate();
