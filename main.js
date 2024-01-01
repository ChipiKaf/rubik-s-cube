"use strict";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

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
const gap = 0.05; // Gap between each cube
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

const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

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
        faces.push("left");
        locations.push(determineLocation(y, z, 'left'));
      }
      if (x === 2) {
        faces.push("right");
        locations.push(determineLocation(y, z));
      }
      if (y === 0) {
        faces.push("bottom");
        locations.push(determineLocation(x, z));
      }
      if (y === 2) {
        faces.push("top");
        locations.push(determineLocation(x, z));
      }
      if (z === 0) {
        faces.push("back");
        locations.push(determineLocation(x, y));
      }
      if (z === 2) {
        faces.push("front");
        locations.push(determineLocation(x, y, 'front'));
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
      console.log(intersectedCube);
      // highlightLine(intersectedCube, normal);
    } else {
      scene.children.forEach(resetHighlight);
    }
  }

  // Updated highlightLine function
  function highlightLine(intersectedCube, normal) {
    const position = intersectedCube.userData.position;

    scene.children.forEach((child) => {
      if (child.userData && child.userData.position) {
        resetHighlight(child);

        // Determine which cubes to highlight
        if (normal.x !== 0 && child.userData.position.x === position.x) {
          applyHighlight(child);
        } else if (normal.y !== 0 && child.userData.position.y === position.y) {
          applyHighlight(child);
        } else if (normal.z !== 0 && child.userData.position.z === position.z) {
          applyHighlight(child);
        }
      }
    });
  }

  function applyHighlight(cube) {
    // Change the cube's material or color to highlight it
    cube.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
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

// Function to determine location on a face based on coordinates
function determineLocation(coord1, coord2, face = 'none') {
  coord1 = Math.floor(coord1);
  coord2 = Math.floor(coord2);
  if (face === 'front') {
    let xName = "";
    let yName = "";
    if (coord2 === 1) yName = "";
    else if (coord2 === 2) yName = "top";
    else if (coord2 === 0) yName = "bottom";

    if (coord1 === 1) xName = "center";
    else if (coord1 === 2) xName = "right";
    else if (coord1 === 0) xName = "left";
    return `${yName}-${xName}`;
  } 
  else if (face === 'left') {
    let zName = "";
    let yName = "";
    if (coord1 === 1) yName = "";
    else if (coord1 === 2) yName = "top";
    else if (coord1 === 0) yName = "bottom";

    if (coord2 === 1) zName = "center";
    else if (coord2 === 2) zName = "right";
    else if (coord2 === 0) zName = "left";
    return `${yName}-${zName}`;
  }
  else {
    if (coord1 === 1 && coord2 === 1) {
      return "center";
    } else if (coord1 === 1) {
      return coord2 === 0 ? "top" : "bottom";
    } else if (coord2 === 1) {
      return coord1 === 0 ? "left" : "right";
    } else {
      if (coord1 === 0 && coord2 === 0) return "top-left";
      if (coord1 === 2 && coord2 === 0) return "top-right";
      if (coord1 === 0 && coord2 === 2) return "bottom-left";
      if (coord1 === 2 && coord2 === 2) return "bottom-right";
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  // Required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  renderer.render(scene, camera);
}

// Events

//

animate();
