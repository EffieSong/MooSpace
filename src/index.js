import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls'
import {
  TransformControls
} from 'three/examples/jsm/controls/TransformControls'

import Stats from 'three/examples/jsm/libs/stats.module.js';

import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
  RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
  UnrealBloomPass
} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import Model from './model'
import CustomMaterial from './ExtendMaterial.js'
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
  bloomStrength: 0.,
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


// https://github.com/Fyrestar/THREE.extendMaterial
// let extendShaderMaterial =  THREE.extendMaterial(THREE.MeshStandardMaterial, {

//   material: {
//     transparent: true
//   },
//   // Will be prepended to vertex and fragment code
//   header: 'varying vec3 vNN; varying vec3 vEye;',
//   fragmentHeader: 'uniform vec3 fresnelColor;',
//   // Insert code lines by hinting at a existing

//   vertex: {
//     // Inserts the line after #include <fog_vertex>
//     '#include <fog_vertex>': `

//           mat4 LM = modelMatrix;
//           LM[2][3] = 0.0;
//           LM[3][0] = 0.0;
//           LM[3][1] = 0.0;
//           LM[3][2] = 0.0;

//           vec4 GN = LM * vec4(objectNormal.xyz, 1.0);
//           vNN = normalize(GN.xyz);
//           vEye = normalize(GN.xyz-cameraPosition);`
//   },

//   fragment: {
//     'gl_FragColor = vec4( outgoingLight, diffuseColor.a );': `
// gl_FragColor = vec4(gl_FragColor.rgb, 0.2);
// gl_FragColor.rgba +=  ( 1.0 - -min(dot(vEye, normalize(vNN) ), 0.0) ) * vec4(fresnelColor,0.9)*0.9;
// `
//   },
//   // Uniforms (will be applied to existing or added)
//   uniforms: {
//     diffuse: new THREE.Color('white'),
//     fresnelColor: new THREE.Color('pink')
//   }
// });

// let sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
// let sphereShaderMaterial =  new THREE.ShaderMaterial({
//   vertexShader: vertex_sphere,
//   fragmentShader: fragment_sphere,
//   transparent: true,
//   uniforms: {
//       uTime: { value: 0 },
//       diffuse: { value: new THREE.Color('white')},
//       fresnelColor: {value: new THREE.Color('yellow')}
//   }
// })
// let mesh = new THREE.Mesh(sphereGeometry, sphereShaderMaterial);
// scene.add(mesh);

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

//const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
let plane = new THREE.Mesh(planeGeometry, planeShaderMaterial);
scene.add(plane);


// const spriteMaterial = new THREE.SpriteMaterial( { color: 0xffffff  } );

// const sprite = new THREE.Sprite( spriteMaterial );
// scene.add( sprite );
/*------------------------------
Models
------------------------------*/
// const horse = new Model({
//   name:'sheep',
//   file:'./models/sheep2.glb',
//   scene: scene
// })


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