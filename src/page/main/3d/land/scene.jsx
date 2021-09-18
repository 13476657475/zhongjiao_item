import * as THREE from '../jsm/three.module.js';
import { message } from 'antd';

import { OrbitControls } from '../jsm/controls/OrbitControls.js';
let container;
let land, landGroup1;
let scene, camera, renderer;
let controls;

let animationFrame;


// let landMaterial;

let maskPlane;

// worker监听完成计算的回调
function workerOnMessage(data) {
    switch (data.cmd) {
        case 'CuttingSurface1':

            break;
        default:
            break;
    };
}
function threeInit(mount) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer = new THREE.WebGLRenderer();
    scene.background = new THREE.Color(0x74B8FC);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    // controls.maxDistance = 3000;


    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    animate();
    
    controls.update();
}
function animate () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};
function createRect() {

    // 平面几何图形
    // http://threejs.outsidelook.cn/r89/source/docs/index.html?q=PlaneGeometry#Reference/Geometries/PlaneGeometry
    let geometry = new THREE.PlaneGeometry(13000000000, 1300000000);

    let material = new THREE.MeshBasicMaterial({ color: 0xff0044, side: THREE.DoubleSide });

    let rect = new THREE.Mesh(geometry, material);
    return rect;
}
//第三模板土地初始加载
function initThreeLandScene(mount) {
    threeInit(mount);
    console.log("scene", scene)
}
export {
    scene,
    controls,
    initThreeLandScene,
    workerOnMessage,
};