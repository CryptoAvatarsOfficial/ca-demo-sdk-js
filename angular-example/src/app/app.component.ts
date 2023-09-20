import { Component, HostListener } from '@angular/core';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { Vipe } from '@vipeio/sdk';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    private readonly vipe = new Vipe({ apiKey: "$2b$10$EfHC7O4G9bqfqxrsrDfAPesR1napi3.4NVX3y6cTrjlO2Qfh4P6iy", avatarSelectorConfig: { mode: "iframe" } });

    private readonly scene = new THREE.Scene();
    private readonly camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    private readonly Alight = new THREE.AmbientLight(0xFFFFFF, 1);
    private readonly Dlight = new THREE.DirectionalLight(0xFFFFFF, 1);
    private readonly renderer = new THREE.WebGLRenderer({ antialias: true });

    private controls: OrbitControls;
    private vrmModel: THREE.Group;

    ngOnInit() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor("#E3E3E3");
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        this.camera.position.z = 3.5;
        this.camera.position.y = 1.5;

        this.camera.add(this.Dlight);
        this.camera.add(this.Alight);
        this.camera.updateProjectionMatrix();

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target = new THREE.Vector3(0, 1.5, 0);

        this.scene.add(this.Dlight);
        this.scene.add(this.Alight);
        this.scene.add(this.camera);

        const grid = new THREE.GridHelper(10, 10, 0x000000, 0x000000);
        this.scene.add(grid);

        this.renderer.render(this.scene, this.camera);

        document.body.appendChild(this.renderer.domElement);

        this.repaint();
    }

    openAvatarSelector() {
        this.vipe.openAvatarSelector((nft, url) => {
            console.log("AVATAR SELECTED", { nft, url })
            this.loadVRM(url);
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.renderer.setSize(event.target.innerWidth, event.target.innerHeight);
        this.camera.aspect = event.target.innerWidth / event.target.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    repaint = () => {
        requestAnimationFrame(this.repaint);

        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        if (this.camera.position.y < 0.12)
            this.camera.position.y = 0.12;
        if (this.camera.position.y > 3.5)
            this.camera.position.y = 3.5;
    }

    loadVRM(url: string) {
        const gltfLoader = new GLTFLoader();
        gltfLoader.register((parser) => new VRMLoaderPlugin(parser));
        gltfLoader.load(url, (gltf) => {
            const vrm = gltf.userData.vrm;
            VRMUtils.rotateVRM0(vrm);

            if (this.vrmModel) {
                this.scene.remove(this.vrmModel);
            }

            console.log("VRM", vrm);

            this.vrmModel = gltf.scene;
            this.scene.add(this.vrmModel);
        });
    }

}
