
//NOTES als je weer opnieuw moet leren
//videotextures later toevoegen?
//schaap andere naam geven en losse animatie toevoegen
// pointer voor schaap weghalen
//en het bestand opmaken PLEASE mijn ogen doen pijn en het is net een doolhof
// piano opnieuw animeren in blender T_T
//modals opmaken

import './style.css';
import { gsap } from 'gsap';
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
let currentHoveredObject = null;
const pointer = new THREE.Vector2();
let animationMixer = null; //animatie van de piano
const clock = new THREE.Clock();

//links
const links = {
    "vinyl": 'https://open.spotify.com/playlist/3cYtUxSr9T3rnCFuDbgGtD?si=4c9709f998e94abd',
    "poster": 'https://youtu.be/01WEqntM1NI',
};

let isModalOpen = false;
//modal knoppen
const modals = {
  work: document.querySelector('.work.modal'),
  about: document.querySelector('.about.modal'),
  contact: document.querySelector('.contact.modal'),
};

const showModal = (modal) => {
  modal.style.display = 'block';
  isModalOpen = true;
  controls.enabled = false;
  
//gsap niet vergeten te importeren bovenaan
  gsap.set(modal, { opacity: 0, y: -50 });
  gsap.to(modal, { opacity: 1, y: 0, duration: 0.5});  
}

const hideModal = (modal) => {
  isModalOpen = false;
  controls.enabled = true;
  gsap.to(modal, { opacity: 0, y: -50, duration: 0.5, onComplete: () => {
    modal.style.display = 'none';
  }});
}

//mobile en mouse erbij
document.querySelectorAll('.modal-close').forEach((button) => {
  button.addEventListener('touchend', () => {
    const modal = button.closest('.modal');
    hideModal(modal);
  });
}, { passive: false });

//click  doet hier niet raar, maar bij de links wel
document.querySelectorAll('.modal-close').forEach((button) => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal');
    hideModal(modal);
  });
}, { passive: false });


//animatie on hover
function playHoverAnimation(object, isHovering) {
    gsap.killTweensOf(object.scale);//position en rotation ook toevoegen als je die doet
    object.userData.isAnimating = true;

    if (isHovering) {
        gsap.to(object.scale, { 
            x: object.userData.initialScale.x * 1.3, 
            y: object.userData.initialScale.y * 1.3, 
            z: object.userData.initialScale.z * 1.3, 
            duration: 0.3,
            ease: "bounce.Out(1.8)",
        });
}
    else {
        gsap.to(object.scale, { 
            x: object.userData.initialScale.x, 
            y: object.userData.initialScale.y, 
            z: object.userData.initialScale.z, 
            duration: 0.2,
            ease: "bounce.Out(1.8)",
        });
      }
}

//renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(new THREE.Color(0.55, 0.37306, 0.2145), 1);


//loaders
const textureLoader = new THREE.TextureLoader();

//model loader (met npm install en vite draco map halen uit node modules)
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

//load texture
const myTexture = textureLoader.load('/textures/texturepack.webp');
myTexture.flipY = false; 
myTexture.colorSpace = THREE.SRGBColorSpace;

//Load Model
loader.load('/models/portfolio_room.glb', function (glb) {
    const model = glb.scene;

    // animatie van piano
    animationMixer = new THREE.AnimationMixer(model);
    
    // speelt elke animatie, timing klopt niet dus moet het in blender 1 object maken en animeren
    glb.animations.forEach((clip) => {
        const action = animationMixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        action.play();
    });
    
    glb.scene.traverse((child) => {
        if (child.isMesh) {
            if (child.name.includes("hover")) {
                intersectObjects.push(child);
                child.userData.initialScale = new THREE.Vector3().copy(child.scale);
                child.userData.initialrotation = new THREE.Euler().copy(child.rotation);
                child.userData.initialposition = new THREE.Vector3().copy(child.position);
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
function handleRaycaster() {
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
}

window.addEventListener('mousemove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
});

// mouse down in plaats van click voor accidental kliks on camera beweging
window.addEventListener('mousedown', handleRaycaster);

// optimization voor apple en touch devices
window.addEventListener('touchstart', (e) => {
  e.preventDefault()
    pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.touches[0].clientY / window.innerHeight) * 2 + 1;
    handleRaycaster();
}, { passive: false })

//als je terug komt op de pagina gaat de camera niet crazy
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    controls.enabled = false;
  } else {
    if (!isModalOpen) {
      controls.enabled = true;
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
    const deltaTime = clock.getDelta();
    if (animationMixer) animationMixer.update(deltaTime);
    
    controls.update();
    renderer.render(scene, camera);
    raycaster.setFromCamera(pointer, camera);

    currentIntersects = raycaster.intersectObjects(intersectObjects);
    for (let i = 0; i < currentIntersects.length; i++) {
    }
    if (currentIntersects.length > 0) {
      const currentIntersectObject = currentIntersects[0].object;
      
      if(currentIntersectObject.name.includes("hover")) {
        if (currentHoveredObject !== currentIntersectObject) {
            if (currentHoveredObject) {
                playHoverAnimation(currentHoveredObject, false);
            }
            playHoverAnimation(currentIntersectObject, true);
            currentHoveredObject = currentIntersectObject;
        }
        document.body.style.cursor = 'pointer';
    } else {
        if (currentHoveredObject) {
            playHoverAnimation(currentHoveredObject, false);
            currentHoveredObject = null;
        }
        document.body.style.cursor = 'default';
    }
    
    } else {
        if (currentHoveredObject) {
            playHoverAnimation(currentHoveredObject, false);
            currentHoveredObject = null;
        }
        document.body.style.cursor = 'default';
    }
}

renderer.setAnimationLoop(animate);