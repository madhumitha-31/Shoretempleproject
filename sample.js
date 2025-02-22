import * as THREE from './libs/three/build/three.module.js';
import { GLTFLoader } from './libs/three/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './libs/three/jsm/controls/OrbitControls.js';
import { EffectComposer } from './libs/three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './libs/three/jsm/postprocessing/RenderPass.js';
import { SSAOPass } from './libs/three/jsm/postprocessing/SSAOPass.js';
import TWEEN from './libs/tween/tween.esm.js';


console.log("Script loaded");

// Scene setup
const scene = new THREE.Scene();
console.log("Scene created");

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 1, 11);  // Set the camera position
console.log("Camera created and positioned");

const renderer = new THREE.WebGLRenderer({ antialias: true, precision: 'highp' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false; // Disable all shadows in the renderer
renderer.xr.enabled = true; // Enable WebXR for VR
console.log("Renderer created with XR enabled");
renderer.localClippingEnabled = true; // Enable global clipping

// Effect Composer setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
ssaoPass.kernelRadius = 1; // Lower values make SSAO shadows smaller
ssaoPass.minDistance = 5; // Increase to reduce dark patches in crevices
ssaoPass.maxDistance = 0.01; // Lower to limit how far SSAO shadows extend
ssaoPass.intensity = 1; // Reduce SSAO effect strength (default ~1)
composer.addPass(ssaoPass);

// Append the renderer to the model placeholder div
const modelPlaceholder = document.getElementById('model-placeholder');
modelPlaceholder.appendChild(renderer.domElement);

// Scene background
scene.background = new THREE.Color(0xADD8E6);

// Lighting setup...
// Directional Lighting with Brownish tone - Soft natural sunlight
const frontLeftDirectionalLight = new THREE.DirectionalLight(0xA9A9A9, 1.5); // Brownish light for natural sunlight
frontLeftDirectionalLight.position.set(10, 10, 10); // Position adjusted for optimal lighting
frontLeftDirectionalLight.castShadow = false;
scene.add(frontLeftDirectionalLight);

const frontRightDirectionalLight = new THREE.DirectionalLight(0xA9A9A9, 1.5); // Matching brownish tone for front-right light
frontRightDirectionalLight.position.set(-10, 10, 10);
frontRightDirectionalLight.castShadow = false;
scene.add(frontRightDirectionalLight);


// Back Lights with Brownish tone for natural effects
const backLeftDirectionalLight = new THREE.DirectionalLight(0xA9A9A9, 1.5);
backLeftDirectionalLight.position.set(10, 10, -10);
backLeftDirectionalLight.castShadow = false;
scene.add(backLeftDirectionalLight);

const backRightDirectionalLight = new THREE.DirectionalLight(0xA9A9A9, 1.5);
backRightDirectionalLight.position.set(-10, 10, -10);
backRightDirectionalLight.castShadow = false;
scene.add(backRightDirectionalLight);


// Side Lights for balanced illumination
const leftSideLight = new THREE.DirectionalLight(0xffeda6, 1);  // Slightly lower intensity for balance
leftSideLight.position.set(5, 5, 10);
leftSideLight.target.position.set(0, 0, 0);
leftSideLight.castShadow = false;
scene.add(leftSideLight);
scene.add(leftSideLight.target); 

const leftSideLight1 = new THREE.DirectionalLight(0xffeda6, 1.2);  // Slightly lower intensity for balance
leftSideLight1.position.set(5, 5, -10);
leftSideLight1.target.position.set(0, 0, 0);
leftSideLight1.castShadow = false;
scene.add(leftSideLight1);
scene.add(leftSideLight1.target);

const rightSideLight = new THREE.DirectionalLight(0xffeda6, 1);
rightSideLight.position.set(-5, 5, 10);
rightSideLight.target.position.set(0, 0, 0);
rightSideLight.castShadow = false;
scene.add(rightSideLight);
scene.add(rightSideLight.target);  

const spotLight = new THREE.SpotLight(0xffd700, 1);  // A bit less intense to soften effect
spotLight.position.set(5, 10, 5);
spotLight.angle = Math.PI / 4; 
spotLight.castShadow = false;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight); 

// Ambient Light for softer fill
const ambientLight = new THREE.AmbientLight(0xffd700, 0.3);  // Reduced ambient light for more contrast
ambientLight.castShadow = false;
scene.add(ambientLight);

// Hemisphere Light to add realistic sky reflections at lower intensity
const hemiLight = new THREE.HemisphereLight(0xFFFAF0, 0x404040, 0.6); // Warmer ground color for a realistic beach vibe
hemiLight.castShadow = false;
scene.add(hemiLight);

// Tone Mapping - Adjusting exposure and settings to give more natural sunlight feel
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;  // Increased exposure to keep brightness natural
renderer.antialias = true;
renderer.setPixelRatio(window.devicePixelRatio);


// Adjust fog to be slightly lighter for a coastal atmosphere, but reduce haze
scene.fog = new THREE.Fog(0xD1E8E2, 0, 120);  // Light fog, mimicking coastal humidity 

// Zoom functionality
let zoomSpeed = 0.1;  // Speed of zooming
let minZoom = 0.1;      // Minimum camera distance
let maxZoom = 5;      // Maximum camera distance

window.addEventListener('wheel', (event) => {
  if (event.deltaY < 0) {
    camera.position.z -= zoomSpeed;  // Zoom in
  } else {
    camera.position.z += zoomSpeed;  // Zoom out
  }
  // Reduce maxZoom to set the limit closer
  camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));

  // Optional: If you want a tighter zoom-out restriction, you can set a stronger cap for maxZoom
  if (camera.position.z > 4) {  // You can adjust 4 to a value that works for your scene
    camera.position.z = 4;  // Cap zoom-out at 4 units
  }
});


// Check mobile type
function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

// Clipping Plane (Initially at Y = 0)
const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10); // Cutting through Y-axis

// Load 3D model
const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const modelPath = isMobile() ? './assets/Mahb.glb' : './assets/mahab_temp.glb';
loader.load(
  modelPath,
  function (gltf) {
    const model = gltf.scene;
    scene.add(model);
    console.log("Model loaded successfully", isMobile() ? "Mobile Model" : "Desktop Model");

    // Adjust model position and scale
    model.position.set(0, 0, 0);
    model.scale.set(0.22, 0.20, 0.22);
    model.rotation.set(0, Math.PI, 0); 

    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3(0, 1, 11);
    box.getCenter(center);
    model.position.sub(center);

    if(!isMobile()){
    function createClickableHTMLPoint(point, model, infoTitle, infoText) {
      // Create HTML div for the clickable point
      const div = document.createElement("div");
      div.classList.add("pulse-point");
      div.style.position = "absolute";
      div.style.width = "15px";
      div.style.height = "15px";
      div.style.backgroundColor = "white";
      div.style.borderRadius = "50%";
      div.style.cursor = "pointer";
      div.style.boxShadow = "0 0 10px white";
      div.style.transform = "translate(-50%, -50%)";
      document.body.appendChild(div);
  
      // Create info box (hidden by default)
      const infoBox = document.createElement("div");
      infoBox.classList.add("info-box");
      infoBox.style.position = "absolute";
      infoBox.style.backgroundColor = "white";
      infoBox.style.padding = "8px";
      infoBox.style.border = "1px solid black";
      infoBox.style.borderRadius = "5px";
      infoBox.style.display = "none";
      infoBox.style.color = "red";
      document.body.appendChild(infoBox);
  
      // Ensure title and text are properly set
      function updateInfoBox() {
          infoBox.innerHTML = `<h3>${infoTitle}</h3><p>${infoText}</p>`;
      }
      updateInfoBox();
  
      // Function to update div position based on 3D model position
      function updatePosition() {
          const worldPos = point.getWorldPosition(new THREE.Vector3());
          const vector = worldPos.project(camera);
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
          
          div.style.left = `${x}px`;
          div.style.top = `${y}px`;
          infoBox.style.left = `${x + 20}px`; // Offset from point
          infoBox.style.top = `${y}px`;
  
          // Fade effect based on distance to camera
          const distance = camera.position.distanceTo(worldPos);
          const opacity = THREE.MathUtils.clamp(1 - (distance / 5), 0.6, 1);
          div.style.backgroundColor = `rgba(300, 255, 255, ${opacity})`;
          div.style.boxShadow = `0 0 10px rgba(255, 255, 255, ${opacity})`;
      }
  
      // Update position when camera moves
      function animate() {
          updatePosition();
          requestAnimationFrame(animate);
      }
      animate();
  
      // Show info box on click
      div.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent hiding on global click
          infoBox.style.display = "block";
          moveCameraToPoint(point);
      });
  
      // Hide info box when clicking anywhere else
      window.addEventListener("click", (event) => {
          if (!div.contains(event.target) && !infoBox.contains(event.target)) {
              infoBox.style.display = "none";
          }
      });
  
      return { updatePosition };
  }

  // Function to smoothly move the camera to a point
function moveCameraToPoint(targetPoint) {
  const targetPos = targetPoint.getWorldPosition(new THREE.Vector3());
  const offset = new THREE.Vector3(0, 2, 5); // Adjusted offset to keep some distance
  const targetViewPos = targetPos.clone().add(offset);
  const duration = 1.5; // Duration in seconds
  const startPos = camera.position.clone();
  const startTime = performance.now();
  
  function animateCamera() {
      const elapsed = (performance.now() - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      
      camera.position.lerpVectors(startPos, targetViewPos, t);
      camera.lookAt(targetPos);
      
      if (t < 1) {
          requestAnimationFrame(animateCamera);
      }
  }
  animateCamera();
}

  
  // CSS for pulsing effect
  const style = document.createElement("style");
  style.innerHTML = `
      .pulse-point {
          animation: pulse 1.5s infinite;
      }
      @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
      }
  `;
  document.head.appendChild(style);
  
  // Create Points and Attach to Model
  const pointsData = [
      { position: new THREE.Vector3(0, 12, -7), title: "Feature 1", info: "Feature info." },
      { position: new THREE.Vector3(3, 6, -14), title: "Feature 2", info: "feature info" },
  ];
  
  const htmlPoints = [];
  
  // Add points after the model is loaded
  model.traverse((child) => {
      if (child.isMesh) {
          pointsData.forEach(({ position, title, info }) => {
            const pointGeometry = new THREE.SphereGeometry(0.01, 8, 8); // Small invisible sphere
            const pointMaterial = new THREE.MeshBasicMaterial({ visible: false }); // Invisible material
            const point = new THREE.Mesh(pointGeometry, pointMaterial);
              point.position.copy(position);
              model.add(point);
              const htmlPoint = createClickableHTMLPoint(point, model, title, info);
              htmlPoints.push(htmlPoint);
          });
      }
  });
  
  // Update points dynamically when camera moves
  function updateAllPoints() {
      htmlPoints.forEach(p => p.updatePosition());
  }
  renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
      updateAllPoints();
  });  
}
    if (!isMobile()) {
     // Load PBR textures
     const albedoMap = textureLoader.load('./assets/FFG.jpg');  // Base color (diffuse)
     const normalMap = textureLoader.load('./assets/ddgg.jpg');  // Normal map (adds surface details)
     const roughnessMap = textureLoader.load('./assets/DDFF.jpg');  // Controls roughness
     const metalnessMap = textureLoader.load('./assets/DDFF_INERT.png');  // Controls metal-like properties
     const aoMap = textureLoader.load('./assets/DDFF.jpg');  // Ambient occlusion (shadows)
     const temp = textureLoader.load('./assets/Temple.png')

       model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.clippingPlanes = [plane];
          child.material.clipShadows = true;
        
              // If only one material is present
              let material = child.material;
              if (material) { // Ensure material exists
                  console.log(`Material Name: ${material.name}`);
                  console.log(`Material UUID: ${material.uuid}`);
                  if (material.name === 'rock_surface') {
                    // Replace with MeshStandardMaterial to support lighting
                    let newMaterial = new THREE.MeshStandardMaterial({
                        map: material.map || temp, // Preserve texture
                        normalMap: material.normalMap || null,
                        aoMap: material.aoMap || null,
                        roughnessMap: material.roughnessMap || null,
                        metalnessMap: material.metalnessMap || null,
                        roughness: 1,
                        metalness: 0.0,
                        envMapIntensity: 1.5,
                        clippingPlanes: [plane], // Ensure clipping is enabled
                        clipShadows: true // If you want shadows to be clipped too
                    });
    
                    child.material = newMaterial; // Assign new material
                    child.material.needsUpdate = true;
                    console.log("Updated rock_surface to MeshStandardMaterial");
                }
                  else if (material.name === 'Material') {
                      material.UVMapping = albedoMap ;
                      material.normalMap = normalMap ;
                      material.aoMap = aoMap;
                      material.roughnessMap = roughnessMap ;
                      material.metalnessMap = metalnessMap;
                      material.roughness = 1;
                      material.metalness = 0.0;
                      material.envMapIntensity = 1.5;
                      material.needsUpdate = true;
                      console.log("loaded single");
                }
            }
          }
    });
    //clipslider
    const slider = document.createElement('input');
    slider.type = "range";
    slider.min = "-1";
    slider.max = "4";
    slider.step = "0.01";
    slider.value = "4";
    slider.style.position = "absolute";
    slider.style.bottom = "10px";
    slider.style.left = "50%";
    slider.style.transform = "translateX(-50%)";
    document.body.appendChild(slider);
    

// Update Clipping Plane Dynamically
slider.addEventListener('input', (event) => {
  const value = parseFloat(event.target.value);
  plane.constant = value;
});
    
  }
   
}, 

  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  function (error) {
    console.error('An error occurred while loading the model:', error);
  }
); 

// OrbitControls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enableRotate = true;
controls.enablePan = false;
if(!isMobile()){
// Set the point to rotate around (Example: Object at (0, 5, 0))
controls.target.set(0, 0, 6);
controls.maxDistance = 8; // Adjust as needed
controls.minPolarAngle =-2;  // Prevent looking too far down
controls.maxPolarAngle = Math.PI /2;  // Prevent looking up too high
}
// Raycasting setup for walking (collision detection)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tweenGroup = new TWEEN.Group();

document.addEventListener('dblclick', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);  // Check for intersection

  if (intersects.length > 0) {
    const hitObject = intersects[0].object;
    const hitPoint = intersects[0].point;
    console.log('Clicked point:', hitPoint);  // Debug clicked point

    // Calculate direction to move camera to hitPoint
    const direction = new THREE.Vector3().subVectors(hitPoint, camera.position).normalize();
    console.log('Direction to move:', direction);  // Debug direction

    // Move the camera in the direction of the clicked point
    const distance = camera.position.distanceTo(hitPoint);
    const moveDistance = Math.min(distance, 1);  // limit the movement per click to prevent "jumping" too much

    // Check for obstacle before moving
    const newCameraPosition = camera.position.clone().add(direction.multiplyScalar(moveDistance));

    // Check if the camera will collide with an object
const testRay = new THREE.Raycaster(camera.position, direction, 0, moveDistance); 
const intersectsWithObstacle = testRay.intersectObjects(scene.children, true);

if (intersectsWithObstacle.length === 0) {
    // No obstruction, move the camera
    console.log('Moving camera to new position:', newCameraPosition);
    // Add the camera movement tweening logic
} else {
    console.log('Obstacle detected, cannot move');
}
const bufferDistance = 0.2;  // Change the distance to suit your needs
const adjustedCameraPosition = camera.position.clone().add(direction.multiplyScalar(moveDistance - bufferDistance));
      // Tween to smoothly move camera to the new position
      const cameraTween = new TWEEN.Tween(camera.position)
      .to(adjustedCameraPosition, 2000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start()
      .onUpdate(() => {
        camera.updateProjectionMatrix();
      });

      tweenGroup.add(cameraTween);

      // Smooth camera target change
      const controlsTween = new TWEEN.Tween(controls.target)
        .to(hitPoint, 1000)  // Smoothly move target to the clicked position
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
        .onUpdate(() => {
          controls.update();  // Update controls during tween
        });
      tweenGroup.add(controlsTween);
    }
  }
);

if(!isMobile()){
 //button feature
 const featurePositions = {
  p1: {
    position: new THREE.Vector3( 0.12779464552966988, -1.2080122596642127, 2), // Zoom out by adjusting Z value
    lookAt: new THREE.Vector3( 0.18282783761522473, -0.015533800118175876, 3 ),  // LookAt remains same as clicked point
},
  p2: {
    position: new THREE.Vector3(0, 1, 11),
    LookAt: new THREE.Vector3(0.18,0,3),
  }
};

function moveToFeature(feature) {
  const target = featurePositions[feature];
  if (!target) {
    console.error(`Feature ${feature} not found`);
    return;
  }

   // Animate camera position
   const positionTween = new TWEEN.Tween(camera.position)
   .to(target.position, 2000) // Move to target position in 2 seconds
   .easing(TWEEN.Easing.Cubic.InOut)
   .start();

 tweenGroup.add(positionTween);  // Add to tween group

 // Animate camera's look direction
 const lookAtTween = new TWEEN.Tween(controls.target)
   .to(target.lookAt, 2000) // Smooth look-at animation
   .easing(TWEEN.Easing.Cubic.InOut)
   .onUpdate(() => {
     controls.update();
   })
   .start();

 tweenGroup.add(lookAtTween);  // Add to tween group
}

document.getElementById('p1').addEventListener('click', () => {
  moveToFeature('p1');
});

document.getElementById('p2').addEventListener('click', () => {
  moveToFeature('p2');
});

}
// Animation loop 
function animate() {
  tweenGroup.update();
  renderer.render(scene, camera);
  composer.render();
  requestAnimationFrame(animate);
  controls.update();
  
}

animate(); // Start the animation loop
