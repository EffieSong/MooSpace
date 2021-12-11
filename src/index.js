import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls'
import {
  TransformControls
} from 'three/examples/jsm/controls/TransformControls'


import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
  RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
  UnrealBloomPass
} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


import vertex_plane from './shader/vertexShader.glsl'
import fragment_plane from './shader/fragmentShader.glsl'


let statusEl = document.querySelector(".modelStatus");
let submitBtn = document.querySelector(".submitButton");
let inputBox = document.querySelector(".textarea");
let sentimentResult = document.querySelector(".sentimentResult");

let sentiment = ml5.sentiment('movieReviews', modelReady);
submitBtn.addEventListener("click", getSentiment);

function modelReady() {
  statusEl.innerHTML = 'model loaded';
}

function getSentiment() {
  // get the values from the input
  let text = inputBox.value;
  // make the prediction
  const prediction = sentiment.predict(text);
  // display sentiment result on html page
  sentimentResult.innerHTML = `Sentiment score:${prediction.score}`;
  planeShaderMaterial.uniforms.uColMix.value = prediction.score;

}


let composer;
const params = {
  exposure: 1,
  bloomStrength: 0.1,
  bloomThreshold: 0.7,
  bloomRadius: 0.85
};

/*------------------------------
Renderer
------------------------------*/
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('black', 1);

document.body.appendChild(renderer.domElement);


/*------------------------------
Scene & Camera
------------------------------*/
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 5;
camera.position.y = 1;
// ambient light
scene.add(new THREE.AmbientLight('white', 0.1));
// directional light
var light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(100, 100, -20);
scene.add(light);


/*------------------------------
bloom and composer stuff
------------------------------*/
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(renderScene);
composer.addPass(bloomPass);

/*------------------------------
OrbitControls
------------------------------*/
const controls = new OrbitControls(camera, renderer.domElement);


/*------------------------------
Helpers
------------------------------*/
// const gridHelper = new THREE.GridHelper(10, 10);
// scene.add(gridHelper);
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);


/*------------------------------
Mesh
------------------------------*/


let planeGeometry = new THREE.PlaneGeometry(3, 3);
let planeShaderMaterial = new THREE.ShaderMaterial({
  vertexShader: vertex_plane,
  fragmentShader: fragment_plane,
  transparent: true,
  blending: THREE.LightenBlending,
  uniforms: {
    uTime: {
      value: 0
    },
    diffuse: {
      value: new THREE.Color('white')
    },
    fresnelColor: {
      value: new THREE.Color('yellow')
    },
    uColMix: {
      value: 0.5
    },
    uFrequency: {
      value: 0.
    },
  }
})

let plane = new THREE.Mesh(planeGeometry, planeShaderMaterial);
scene.add(plane);

/*------------------------------
Loop
------------------------------*/
let start_time = Date.now();
const animate = function () {
  requestAnimationFrame(animate);
  // renderer.render(scene, camera);
  composer.render();
  //update uniforms
  planeShaderMaterial.uniforms.uTime.value = (Date.now() - start_time) * .001;
};
animate();


/*------------------------------
Resize
------------------------------*/
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);