import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const Avatar = ({ modelPath }) => {
  const mountRef = useRef(null);
  let mixer;
  let action_idle;
  let action_talk;
  const clock = new THREE.Clock(); // Define clock for delta time calculation

  useEffect(() => {
    const setupScene = () => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      // Set camera position to view the model properly
      camera.position.set(0, 15, 18);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      mountRef.current.appendChild(renderer.domElement);

      // Ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // Hemisphere light
      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
      scene.add(hemisphereLight);

      // Directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(0, 1, 0);
      scene.add(directionalLight);

      // Point light
      const pointLight = new THREE.PointLight(0xffffff, 0.5);
      pointLight.position.set(0, 10, 0);
      scene.add(pointLight);

      // Spotlight
      const spotlight = new THREE.SpotLight(0xffff00, 1); // Yellow light
      spotlight.position.set(5, 5, 5);
      spotlight.castShadow = true;
      scene.add(spotlight);

      const loader = new GLTFLoader();
      loader.load(
        modelPath,
        (gltf) => {
          const gltfScene = gltf.scene;

          // Apply rotation and scale adjustments
          gltfScene.rotation.y = 0.2;
          gltfScene.scale.set(25, 25, 10);

          // Set model position to center it in the scene
          gltfScene.position.set(-5, -10, -10);

          // Traverse the model to set shadows
          gltfScene.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });

          // Setup animations
          const clips = gltf.animations;
          mixer = new THREE.AnimationMixer(gltfScene);
          const clip_idle = THREE.AnimationClip.findByName(clips, "idle");
          const clip_talk = THREE.AnimationClip.findByName(clips, "talk");
          action_idle = mixer.clipAction(clip_idle);
          action_talk = mixer.clipAction(clip_talk);
          action_idle.play();
          action_talk.play();
          scene.add(gltfScene);
        },
        undefined,
        (error) => {
          console.error(error);
        }
      );

      const animate = () => {
        var delta = clock.getDelta();

        if (mixer) mixer.update(delta);

        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        mountRef.current.removeChild(renderer.domElement);
      };
    };

    setupScene();
  }, [modelPath]);

  return <div ref={mountRef} />;
};

export default Avatar;
