import './style.css';
import { gsap } from 'gsap';
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
let currentIntersects = [];
const pointer = new THREE.Vector2();

//links
const links = {
    "vinyl": 'https://open.spotify.com/playlist/3cYtUxSr9T3rnCFuDbgGtD?si=4c9709f998e94abd',
    "poster": 'https://youtu.be/01WEqntM1NI',
};

//modal knoppen
const modals = {
  work: document.querySelector('.work.modal'),
  about: document.querySelector('.about.modal'),
  contact: document.querySelector('.contact.modal'),
};

const showModal = (modal) => {
  modal.style.display = 'block';
//gsap niet vergeten te importeren bovenaan
  gsap.set(modal, { opacity: 0, y: -50 });
  gsap.to(modal, { opacity: 1, y: 10, duration: 0.5});  
}

const hideModal = (modal) => {
  gsap.to(modal, { opacity: 0, y: -50, duration: 0.5, onComplete: () => {
    modal.style.display = 'none';
  }});
}

document.querySelectorAll('.modal-close').forEach((button) => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal');
    hideModal(modal);
  });
});

//renderer
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

    glb.scene.traverse((child) => {
        if (child.isMesh) {
            if (child.name.includes("hover")) 
              {
                intersectObjects.push(child);
            }
        }
    });

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

window.addEventListener('click', () => {
    if (currentIntersects.length > 0) {
        const object = currentIntersects[0].object;
        if (object.name.includes("vinyl")) {
            window.open(links.vinyl, "_blank");
        } else if (object.name.includes("poster")) {
            window.open(links.poster, "_blank");
        }

        if (object.name.includes("work")) {
            showModal(modals.work);
        } else if (object.name.includes("about")) {
            showModal(modals.about);
        } else if (object.name.includes("contact")) {
            showModal(modals.contact);
        }
    }
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

    currentIntersects = raycaster.intersectObjects(intersectObjects);
    for (let i = 0; i < currentIntersects.length; i++) {
    }
    if (currentIntersects.length > 0) {
      const currentIntersectObject = currentIntersects[0].object;    
      if(currentIntersectObject.name.includes("hover")) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
    
    } else {
        document.body.style.cursor = 'default';
    }
}

renderer.setAnimationLoop(animate);