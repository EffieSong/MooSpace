import * as THREE from 'three'
import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader'
//used to loader compressed model
import {
    DRACOLoader
} from 'three/examples/jsm/loaders/DRACOLoader'
//used to unpack moded
import {
    MeshSurfaceSampler
} from 'three/examples/jsm/math/MeshSurfaceSampler'

import vertex from './shader/vertexShader.glsl'
import fragment from './shader/fragmentShader.glsl'




class Model {
    constructor(obj) {
        console.log(obj)
        this.name = obj.name
        this.file = obj.file
        this.scene = obj.scene

        this.loader = new GLTFLoader()
        this.dracoLoader = new DRACOLoader()
        this.dracoLoader.setDecoderPath('./draco/')
        console.log(this.dracoLoader)
        this.loader.setDRACOLoader(this.dracoLoader)

        this.init()
    }
    //create a function to upload our files
    //to load files, we need a threejs unitility called GLTF loader

    init() {
        this.loader.load(this.file, (response) => {

            this.mesh = response.scene.children[0]

            this.material = new THREE.MeshBasicMaterial({
                color: 'white',
                wireframe: true
            })
            this.mesh.material = this.material;

            this.geometry = this.mesh.geometry
            console.log(this.geometry);
            /* Particles Material */
            this.particesMaterial = new THREE.PointsMaterial({
                color: 'white',
                size: 0.01
            })
            
            /* Shader Material */
            this.shaderMaterial = new THREE.ShaderMaterial({
                vertexShader: vertex,
                fragmentShader: fragment,
                uniforms: {
                    uTime: { value: 0 },
                }
            })


            /* Particles Geometry*/
            const sampler = new MeshSurfaceSampler(this.mesh).build();
            const numParticles = 20000;
            this.particlesGeometry = new THREE.BufferGeometry();
            const particlesPosition = new Float32Array(numParticles * 3);
            for (let i = 0; i < numParticles; i++) {
                const newPosition = new THREE.Vector3()
                sampler.sample(newPosition);
                particlesPosition.set([
                    newPosition.x, newPosition.y, newPosition.z
                ], i * 3)

            }

            this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPosition, 3))
            console.log(this.geometry)
            console.log(this.particlesGeometry)



            /* Particles */
            this.particles = new THREE.Points(this.particlesGeometry, this.shaderMaterial)



            //add this mesh inside three.js scene
            this.scene.add(this.particles)
  
        })
    }
}
export default Model