import * as THREE from '../jsm/three.module.js';

import { scene } from './index';
import { shipGroup, shipEquipment } from '../ship';

let camera1, renderer1, camera2, renderer2;
let animate1, animate2;

let loadShipSucceed = false; // 加载船完成

let lookAt1 = '左耙头', lookAt2 = '右耙头';

let l_arm_claw, r_arm_claw;

// 初始化两个独立的场景，供右侧窗口显示
function initOtherRender() {
    // 添加2个场景
    camera1 = new THREE.PerspectiveCamera(70, 1, 1, 1000);
    renderer1 = new THREE.WebGLRenderer({ antialias: true });
    renderer1.setPixelRatio(window.devicePixelRatio);
    shipGroup.add(camera1);

    camera2 = new THREE.PerspectiveCamera(70, 1, 1, 1000);
    renderer2 = new THREE.WebGLRenderer({ antialias: true });
    renderer2.setPixelRatio(window.devicePixelRatio);
    shipGroup.add(camera2);

}

// 配置两个窗口
function setSmallWindow(key, moment) {
    if (moment) {
        if (key === 1) {
            setSmallWindowView(moment, camera1, renderer1);
            animate1 = true;
        } else if (key === 2) {
            setSmallWindowView(moment, camera2, renderer2);
            animate2 = true;
        }
    } else {
        if (key === 1) animate1 = false;
        if (key === 2) animate2 = false;
    }
}

// 设置两个窗口的视图
function setSmallWindowView(moment, camera, renderer) {
    camera.aspect = moment.clientWidth / moment.clientHeight;
    renderer.setSize(moment.clientWidth, moment.clientHeight);
    moment.appendChild(renderer.domElement);
};

// 设置窗口动画
function setWinAnimate() {
    if (!loadShipSucceed) return;
    if (animate1 || animate2) shipGroup.updateMatrixWorld(true); // 更新船的世界坐标，【后续建议放在船移动更新中做可减少不必要的计算，提高性能】
    if (animate1) animateFunc(camera1, renderer1, lookAt1);
    if (animate2) animateFunc(camera2, renderer2, lookAt2);
}

// 请求船体对象
function requestShipObject() {
    l_arm_claw = shipGroup.getObjectByName('左耙头爪组');
    r_arm_claw = shipGroup.getObjectByName('右耙头爪组');

    loadShipSucceed = true; // 船加载完成
}

// 动画函数
function animateFunc(camera, renderer, lookAt) {
    if (lookAt === '左耙头' || lookAt === '右耙头') setCameraPostion(lookAt, camera);
    renderer.render(scene, camera);
}

function setCameraPostion(lookObject, camera) {
    let p;
    switch (lookObject) {
        case '左耙头':
        case '右耙头':
            p = new THREE.Vector3();
            let angle, offsetX;
            if (lookObject === '左耙头') {
                offsetX = -9;
                angle = -1.5707963267948966;
                l_arm_claw.getWorldPosition(p);
            } else {
                offsetX = 9;
                angle = 1.5707963267948966;
                r_arm_claw.getWorldPosition(p);
            }

            p.applyMatrix4(new THREE.Matrix4().getInverse(shipGroup.matrixWorld));
            p.x += offsetX;
            camera.position.copy(p);
            camera.rotation.set(0, angle, 0);

            break;

        case '舱内':
            p = shipEquipment['舱内'];
            console.log(p)
            // camera.position.set(p.x - 2, p.y + 13, p.z + 1.5);
            // camera.rotation.set(-1.5707963267948966, -0.1707963267948966, -1.5707963267948966);
            camera.position.set(p.x, p.y-6, p.z);
            camera.rotation.set(0, 3.1, 0);
            break;

        case '泥门':
            p = shipEquipment['泥门'];
            camera.position.set(p.x - 35, p.y + 10, p.z);
            camera.rotation.set(0, -1.5707963267948966, 0);
            break;

        case '艏吹':
            p = shipEquipment['艏吹'];
            camera.position.set(p.x - 10, p.y, p.z);
            camera.rotation.set(0, -1.5707963267948966, 0);
            break;

        case '是否吹泥':
            p = shipEquipment['是否吹泥'];
            camera.position.set(p.x + 35, p.y, p.z);
            camera.rotation.set(0, 1.5707963267948966, 0);
            break;

        default:
            break;
    }
}

// 更新观察对象
function updatelookAtObject(key, string) {
    if (['左耙头', '右耙头', '舱内', '泥门', '艏吹', '是否吹泥'].includes(string)) {
        if (key === 1) {
            lookAt1 = string;
            setCameraPostion(string, camera1)
        }
        if (key === 2) {
            lookAt2 = string;
            setCameraPostion(string, camera2)
        }
    }
}

export {
    initOtherRender,
    setSmallWindow,
    setWinAnimate,
    requestShipObject,
    updatelookAtObject
};