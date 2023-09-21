'use client'
import * as THREE from 'three';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useEffect, useState } from 'react';
import { Vipe } from '@vipeio/sdk';

const Home = () => {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    const Alight = new THREE.AmbientLight(0xFFFFFF, 1);
    const Dlight = new THREE.DirectionalLight(0xFFFFFF, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const controls = new OrbitControls(camera, renderer.domElement);
    const vipe = new Vipe({ apiKey: "", avatarsPerPage: 24, avatarSelectorConfig: { mode: "iframe" } });

    let vrmModel: THREE.Group;

    useEffect(() => {
        initScene();
        repaint();
    }, []);

    const initScene = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor("#E3E3E3");
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;

        window.onload = function () {
            document.body.appendChild(renderer.domElement);
        }

        camera.position.z = 3.5;
        camera.position.y = 1.5;

        camera.add(Dlight);
        camera.add(Alight);
        camera.updateProjectionMatrix();

        controls.target = new THREE.Vector3(0, 1.5, 0);

        scene.add(Dlight);
        scene.add(Alight);
        scene.add(camera);

        const grid = new THREE.GridHelper(10, 10, 0x000000, 0x000000);
        scene.add(grid);

        renderer.render(scene, camera);
    }

    const repaint = () => {
        requestAnimationFrame(repaint);

        controls.update();
        renderer.render(scene, camera);

        if (camera.position.y < 0.12)
            camera.position.y = 0.12;
        if (camera.position.y > 3.5)
            camera.position.y = 3.5;
    }

    const loadVRM = (url: string) => {
        const gltfLoader = new GLTFLoader();
        gltfLoader.register((parser) => new VRMLoaderPlugin(parser));
        gltfLoader.load(url, (gltf) => {
            const vrm = gltf.userData.vrm;
            VRMUtils.rotateVRM0(vrm);

            if (vrmModel) {
                scene.remove(vrmModel);
            }

            vrmModel = gltf.scene;
            scene.add(vrmModel);
        });
    }

    const selectAvatar = async () => {
        vipe.openAvatarSelector((nft, url) => {
            console.log("AVATAR SELECTED", { nft, url })
            loadVRM(url);
        })
    };

    return (
        <main>
            <h1>VIPE DEMO</h1>
            <button onClick={selectAvatar}>Choose avatar</button>
        </main>
    )
}

export default Home