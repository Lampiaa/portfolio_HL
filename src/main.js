import './style.css'
//NOTES als je weer opnieuw moet leren
//videotextures later toevoegen?

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//maken van scene, camera, renderer
const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");
const sizes = { width: window.innerWidth, height: window.innerHeight };

const camera = new THREE.PerspectiveCamera( 35, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(10.656702417456287, 6.65422849440972, 8.801249875222876);

const intersectObjects = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(new THREE.Color(0.55, 0.37306, 0.2145), 1);


//loaders
const textureLoader = new THREE.TextureLoader();

//model loader (met npm install en vite draco map halen uit node modules)
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco/' );

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

//load texture
const myTexture = textureLoader.load('/textures/texturepack.webp');
myTexture.flipY = false; 
myTexture.colorSpace = THREE.SRGBColorSpace;

//Load Model
loader.load('/models/portfolio_room.glb', function (glb) {
    const model = glb.scene;

//add textures
    model.traverse(function (child) {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ map: myTexture });
        }

        if (child.material && child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
        }
    });



    scene.add(model);

}
);

//camera Controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.3;
controls.update();
controls.target.set(0.36045345205173307, 2.5301161101917504, -0.22702658315286672);

//clickable dingen
window.addEventListener('mousemove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
});


//resizing van scherm
function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', handleResize);


//render loop
function animate() {
    controls.update();
    renderer.render(scene, camera);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(intersectObjects);
    for (let i = 0; i < intersects.length; i++) {
        intersects[i].object.material.color.set(0xff0000);
    }
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
    }
    else {
        document.body.style.cursor = 'default';
    }
}

renderer.setAnimationLoop(animate);