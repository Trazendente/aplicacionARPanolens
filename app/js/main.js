import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

  // Configuración de A-Frame World Tracking
  import "../js/world-tracking.js";

  // Importa A-Frame después de configurar el sistema de renderizado y World Tracking
  import "https://aframe.io/releases/1.4.2/aframe.min.js";


  let camera;

  delete AFRAME.components["ar"];

  // Configuración de A-Frame
  AFRAME.registerComponent("ar", {
    init: function () {
      camera = document.querySelector("[camera]");

      const sceneEl = this.el;

      // Configuración de la cámara
      const cameraEl = document.createElement("a-entity");
      cameraEl.setAttribute("camera", { userHeight: 1.6 });

      // Configuración de la entidad que representa al modelo GLB
      const modelEl = document.createElement("a-entity");
      modelEl.setAttribute("gltf-model", "url(3d/Xbot2.glb)");
      modelEl.setAttribute("scale", "2 2 2");

      // Añade la cámara y el modelo a la escena de A-Frame
      sceneEl.appendChild(cameraEl);
      sceneEl.appendChild(modelEl);

      // Configuración de A-Frame World Tracking
      sceneEl.addEventListener("loaded", function () {
        const trackedEl = document.querySelector("#tracked");

        // Añade el componente world-tracking al plano que contendrá el modelo
        trackedEl.setAttribute("world-tracking", {});
      });
    },
  });

  // Elimina el panorama original y usa solo el panorama2
  const panorama2 = new PANOLENS.ImagePanorama(
    "https://cdn.glitch.global/67ab0bf3-4565-4426-9f58-a2ca9a65c7d3/Playalow3.jpg?v=1704906506513"
  );
  panorama2.rotation.set(0, (75 * Math.PI) / 180, 0);

  let imageContainer = document.querySelector(".image-container");

  const viewer = new PANOLENS.Viewer({
    container: imageContainer,
    autoRotate: false,
    autoRotateSpeed: 0.3,
    controlBar: true,
  });

  viewer.OrbitControls.noZoom = true;

  // Establecer límites de ángulo
  viewer.OrbitControls.minPolarAngle = Math.PI / 3;
  viewer.OrbitControls.maxPolarAngle = Math.PI;

  function createImageHotspot(position, targetPanorama, imageUrl) {
    const hotspot = new PANOLENS.Infospot(1.7, imageUrl);
    hotspot.position.copy(position);
    hotspot.visible = false;

    hotspot.addEventListener("click", () => {
      viewer.setPanorama(targetPanorama);
    });

    return hotspot;
  }

  const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
    panorama2.rotation
  );

  const hotspotImage1 = createImageHotspot(
    new THREE.Vector3(3.7, -7, -17).applyEuler(panorama2.rotation),
    panorama2,
    "https://cdn.glitch.global/04890fec-77c2-4c25-b7b6-ab73ca26688c/vive.png?v=1704694526323"
  );

  panorama2.add(hotspotImage1);

  const hotspotImage2 = createImageHotspot(
    new THREE.Vector3(1.25, -7, -17).applyEuler(panorama2.rotation),
    panorama2,
    "https://cdn.glitch.global/04890fec-77c2-4c25-b7b6-ab73ca26688c/disfruta.png?v=1704694527715"
  );
  panorama2.add(hotspotImage2);

  const hotspotImage3 = createImageHotspot(
    new THREE.Vector3(-1.25, -7, -17).applyEuler(panorama2.rotation),
    panorama2,
    "https://cdn.glitch.global/04890fec-77c2-4c25-b7b6-ab73ca26688c/explora.png?v=1704694527334"
  );
  panorama2.add(hotspotImage3);

  const hotspotImage4 = createImageHotspot(
    new THREE.Vector3(-3.7, -7, -17).applyEuler(panorama2.rotation),
    panorama2,
    "https://cdn.glitch.global/04890fec-77c2-4c25-b7b6-ab73ca26688c/comparte.png?v=1704694526925"
  );

  panorama2.add(hotspotImage4);

  // viewer.add(panorama, panorama2); // Elimina la adición del panorama original

  const loader = new GLTFLoader();
  let model;
  let mixer;

  const listener = new THREE.AudioListener();
  camera.add(listener);
  const audioLoader = new THREE.AudioLoader();
  const sound = new THREE.Audio(listener);

  audioLoader.load(
    "https://cdn.glitch.global/67ab0bf3-4565-4426-9f58-a2ca9a65c7d3/1.Documentary%20Piano%20Loop_1.mp3?v=1704815822036",
    (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.3);
      sound.play();
    }
  );

  loader.load(
    "https://cdn.glitch.global/67ab0bf3-4565-4426-9f58-a2ca9a65c7d3/mascota_v89_idle.glb?v=1704938164882",
    (gltf) => {
      model = gltf.scene;

      model.traverse((child) => {
        if (child.isMesh) {
          child.material.flatShading = false;
          child.material.needsUpdate = true;
          child.material.transparent = false;
          child.material.opacity = 1;
        }
      });

      model.scale.set(2, 2, 2);
      model.position.set(0, -6.8, 0).applyEuler(panorama2.rotation);
      model.rotation.set(0, (-77 * Math.PI) / 180, 0);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
      model.add(ambientLight);

      panorama2.add(model); // Cambia a agregar al panorama2

      const animations = gltf.animations;
      if (animations && animations.length) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(animations[0]);
        action.setLoop(THREE.LoopRepeat);
        action.clampWhenFinished = true;
        action.play();
      }

      console.log("Modelo GLB cargado correctamente:", model);
    },
    undefined,
    (error) => {
      console.error("Error loading GLB", error);
    }
  );

  window.addEventListener("resize", () => {
    viewer.onWindowResize();
  });

  panorama2.addEventListener("enter", () => {
    console.log("Entrando a panorama2");
    backButton.style.display = "block";
    hotspotImage1.visible = false;
    hotspotImage2.visible = false;
    hotspotImage3.visible = false;
    hotspotImage4.visible = false;
  });

  const backButton = document.getElementById("backButton");
  backButton.addEventListener("click", () => {
    viewer.setPanorama(panorama2); // Cambia a panorama2
  });

  const loadAndPlayAudio = () => {
    // Verifica que 'camera' esté definida antes de usarla
    if (camera) {
      const listener = new THREE.AudioListener();
      camera.add(listener);

      const audioLoader = new THREE.AudioLoader();
      const sound = new THREE.Audio(listener);

      audioLoader.load(
        "https://cdn.glitch.global/4dee2655-f2f5-4285-ba64-c81951daa167/Audio_Locu2.mp3?v=1704735051489",
        (buffer) => {
          sound.setBuffer(buffer);
          sound.setVolume(1);
          sound.play();

          hotspotImage1.visible = true;
          hotspotImage2.visible = true;
          hotspotImage3.visible = true;
          hotspotImage4.visible = true;

          reserveButton.style.display = "none";
        }
      );
    }
  };

  const reserveButton = document.getElementById("IniciaAQUI");

  if (reserveButton) {
    console.log("Botón encontrado:", reserveButton);
    reserveButton.addEventListener("click", loadAndPlayAudio);
  } else {
    console.error("Error: No se encontró el botón 'IniciaAQUI'");
  }

  function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
      mixer.update(0.016);
    }
  }

  animate();

