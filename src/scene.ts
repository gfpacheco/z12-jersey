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
    const texture = new TextureLoader().load(
      `${import.meta.env.BASE_URL}texture.png`,
    );
    texture.flipY = false;
    texture.colorSpace = SRGBColorSpace;

    const material = new MeshStandardMaterial({ map: texture });

    new GLTFLoader().load(
      `${import.meta.env.BASE_URL}jersey.glb`,
      function (gltf) {
        jersey = gltf.scene;
        jersey.scale.set(0.05, 0.05, 0.05);

        jersey.traverse((child) => {
          if (child instanceof Mesh) {
            child.material = material;
          }
        });

        scene.add(jersey);

        const cameraTarget = jersey.position.clone();
        cameraTarget.y += 0.75;
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
