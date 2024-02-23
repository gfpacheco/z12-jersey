import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  WebGLRenderer,
  Group,
  Object3DEventMap,
  Material,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { toggleFullScreen } from './helpers/fullscreen';
import { resizeRendererToDisplaySize } from './helpers/responsiveness';
import './style.css';

const CANVAS_ID = 'scene';

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let scene: Scene;
let pointLight: PointLight;
let jersey: Group<Object3DEventMap>;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;

function loadMaterial(fileName: string) {
  const texture = new TextureLoader().load(
    `${import.meta.env.BASE_URL}${fileName}`,
  );
  texture.flipY = false;
  texture.colorSpace = SRGBColorSpace;

  return new MeshStandardMaterial({ map: texture });
}

const materials = {
  regular: loadMaterial('regular.png'),
  libero: loadMaterial('libero.png'),
};

function applyMaterial(material: Material) {
  jersey?.traverse((child) => {
    if (child instanceof Mesh) {
      child.material = material;
    }
  });
}

init();
animate();

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!;
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    scene = new Scene();
  }

  // ===== 📦 OBJECTS =====
  {
    new GLTFLoader().load(
      `${import.meta.env.BASE_URL}jersey.glb`,
      function (gltf) {
        jersey = gltf.scene;
        jersey.scale.set(0.05, 0.05, 0.05);

        applyMaterial(materials.regular);

        scene.add(jersey);

        const cameraTarget = jersey.position.clone();
        cameraTarget.y += 0.65;
        cameraControls.target = cameraTarget;
      },
      undefined,
      function (error) {
        console.error(error);
      },
    );
  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(
      50,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100,
    );
    camera.position.set(1, 1, 2);
  }

  // ===== 💡 LIGHTS =====
  {
    pointLight = new PointLight('#ffffff', 10);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas);
    cameraControls.enableDamping = true;
    cameraControls.autoRotate = true;
    cameraControls.update();

    // Full screen
    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas);
      }
    });

    document.getElementById('regular')?.addEventListener('click', () => {
      applyMaterial(materials.regular);
    });

    document.getElementById('libero')?.addEventListener('click', () => {
      applyMaterial(materials.libero);
    });
  }

  // ===== 🪄 HELPERS =====
  {
    const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray');
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cameraControls.update();
  pointLight.position.copy(camera.position);

  renderer.render(scene, camera);
}
