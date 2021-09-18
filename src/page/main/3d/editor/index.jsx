import * as THREE from '../jsm/three.module.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { TransformControls } from '../jsm/controls/TransformControls.js'

import { addShip } from '../ship';
import { ctrlGroup, ctrlTransformEvent, ctrlClickEvent, setShipKnownData, deleteTransformObject } from './ctrl';

import { requestShipKnownInfo } from '../../requestParent';

let container;
let containerH;
let scene, camera, renderer;
let controls, transform;

let shipGroup = new THREE.Group();
shipGroup.name = '船模型组';

let animationFrame;

function init(mount,H) {

    container = mount;
    containerH = H;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / H, 1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true });

    scene.background = new THREE.Color(0x74B8FC);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, H);
    container.appendChild(renderer.domElement);
    // console.log(container);
    // console.log(container.clientWidth, containerH);
    // camera.position.set(0, 20, 0);
    controls = new OrbitControls(camera, renderer.domElement);
    transform = new TransformControls(camera, renderer.domElement);
    // transform.setSpace('local');
    scene.add(transform);

    let dirL = new THREE.DirectionalLight(0xffffff, 3);
    dirL.position.set(1, 1, 1)
    scene.add(dirL);

    let ambL = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambL);

    addShip(shipGroup, () => {
        // group.updateMatrixWorld(true);
        shipGroup.rotation.y = Math.PI / 2;
        let box = new THREE.Box3().setFromObject(shipGroup);
        let centerVecter = new THREE.Vector3();
        box.getCenter(centerVecter);

        let sub_x = box.max.x - box.min.x,
            sub_y = box.max.y - box.min.y,
            sub_z = box.max.z - box.min.z;

        let b = Math.max(sub_x, sub_y) / 2; // 求横纵做坐标最大值的一半为tan的对边值

        // let a = b / Math.tan(THREE.MathUtils.degToRad(camera.fov)); // 因为相机的fov为45°，tan45 = 1 ，所以省去计算。

        camera.position.copy(centerVecter);
        camera.position.y = b + sub_z + 5; // 高度定为推到出来的邻边值 + 船高 + 5的拓展高度值
        // camera.position.y = 5; // 高度定为推到出来的邻边值 + 船高 + 5的拓展高度值
        // centerVecter.y = 0;
        controls.target.copy(centerVecter);
        controls.update();

        // 请求船能够提供的组件数据
        requestShipKnownInfo(setShipKnownData);

    });
    scene.add(shipGroup);
    scene.add(ctrlGroup);

    window.out_scene = scene;
    window.out_controls = controls;

    transform.addEventListener('dragging-changed', function (event) {
        controls.enabled = !event.value;
    });


    transform.addEventListener('objectChange', function (event) {
        if (transform.mode === 'translate') {
            ctrlTransformEvent();
        }
    });

    enableScene();

    setTimeout(onWindowResize, 100); // 用于界面div获取到宽高，延迟处理

}

function animate() {
    animationFrame = requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    containerH = document.body.clientHeight-114;
    camera.aspect = container.clientWidth / containerH;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, containerH);
}

function onClick(event) {
    let mouse = new THREE.Vector2();
    let rect = renderer.domElement.getBoundingClientRect();

    mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    mouse.y = - (event.clientY - rect.top) / rect.height * 2 + 1;

    ctrlClickEvent(mouse);
}

// 按下事件监听
function onKeydown(event) {
    switch (event.keyCode) {
        case 8:
        case 46:
            deleteTransformObject();
            break;
        default:
            break;
    }
}

// 启用场景
function enableScene() {
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('click', onClick, false);
    window.addEventListener('keydown', onKeydown, false);
    animate();
}

function initEditor(mount,H) {
    if (!renderer) {
        init(mount,H);
    } else {
        container = mount;
        enableScene();
        container.appendChild(renderer.domElement);
        setTimeout(onWindowResize, 100); // 用于界面div获取到宽高，延迟处理
    }
}

function stopEditor(mount) {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (renderer) {
        window.removeEventListener('resize', onWindowResize, false);
        renderer.domElement.removeEventListener('click', onClick, false);
        window.removeEventListener('keydown', onKeydown, false);
        // mount.removeEventListener('click', onMouseClick, false);
    }
}




export {
    scene,
    controls,
    transform,
    shipGroup,
    initEditor,
    stopEditor,
};