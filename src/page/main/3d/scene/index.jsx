import * as THREE from '../jsm/three.module.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';

import { TWEEN } from '../jsm/libs/tween.module.min.js';

import { initOtherRender, setWinAnimate } from './setWindow';

import { initWater } from './water';
import { initLand } from '../land';
import { initShip, getShipCenter } from '../ship';
import store from '../../../../redux/store';

import { requestLand } from '../../../../api/server';
import { worker } from '../land/worker.js';

let container;

let scene, camera, renderer;
let controls;

let water, land, ship; // 海 地 船

let animationFrame;

let initCenterPosi = {};
let fileCenterPosition = {}, currentFileSize = {};
function init(mount) {

    container = mount;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientWidth, 0.5, 8000);
    renderer = new THREE.WebGLRenderer({ antialias: true });

    scene.background = new THREE.Color(0x74B8FC);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth,container.clientWidth);
    container.appendChild(renderer.domElement);


    camera.position.set(0, 50, 120);//设置相机位置
    // camera.rotation.set(0, -20, 0);
    camera.rotateY(-20)
//     var axes = new THREE.AxisHelper(30);
// scene.add(axes);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    controls.autoRotate = true;
    let dirL = new THREE.DirectionalLight(0xffffff, 3);
    dirL.position.set(1, 1, 1);
    scene.add(dirL);
    let ambL = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambL);
    controls.maxDistance = 2000;
    if (!isDaylight()) {
        scene.background = new THREE.Color(0x74B8FC);
    } else {
        scene.background = new THREE.Color(0x000000);
        // let light = new THREE.PointLight(0xFF8C00, 10, 50);
        // light.position.set(1, 40, -120);
        // light.name = "头灯";
        // scene.add(light);
        // let light1 = new THREE.PointLight(0xFF8C00, 10, 80);
        // light1.position.set(1, 40, -50);
        // light1.name = "中间灯";
        // scene.add(light1);
        // let light2 = new THREE.PointLight(0xFF8C00, 140, 90);
        // light2.position.set(8, -10, -30);
        // light2.name = "尾灯";
        // scene.add(light2);
    }
    // 加载水
    water = initWater(2000, 2000);
    water.position.set(0, 0, 10)
    scene.add(water);
    // console.log("store.getState().waterShow", store.getState().scenePageCtrlInfo.waterShow)
    // 加载地
    land = initLand();
    scene.add(land);
    // 请求并添加船
    ship = initShip();
    scene.add(ship);
}

// 页面缩放的监听事件
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientWidth;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientWidth);
}

// 初始化场景
function initScene(mount, H) {
    if (!renderer) {
        init(mount);
        initOtherRender(); // 初始化两个小窗口的
    } else {
        container = mount;
        container.appendChild(renderer.domElement);
        onWindowResize();
    }
    enableScene(); // 启动场景
}
function changeDepth() {
    for (let i = scene.children.length - 1; i >= 0; i--) {
        if (scene.children[i].name === "地质组") {
            scene.children[i].children.splice(0, scene.children[i].children.length);
        }
    }
}
// 切换水深文件土地数据、更新视野
function upLandData(params) {
    requestLand(params).then(function (res) {
        store.dispatch({
            type: 'SET_LOADING',
            data: true,
        });
        store.dispatch({
            type: 'SET_LOADINGWORD',
            data: "水深加载中",
        });

        fileCenterPosition.centerX = (res.data.positionlist[res.data.positionlist.length - 1].maxx + res.data.positionlist[0].minx) / 2;
        fileCenterPosition.centerY = (res.data.positionlist[res.data.positionlist.length - 1].maxy + res.data.positionlist[0].miny) / 2;
        currentFileSize.maxx = res.data.positionlist[res.data.positionlist.length - 1].maxx;
        currentFileSize.maxy = res.data.positionlist[res.data.positionlist.length - 1].maxy;
        currentFileSize.minx = res.data.positionlist[0].minx;
        currentFileSize.miny = res.data.positionlist[0].miny;
        if (res.data.positionlist.length > 0) {
            updatePerspectivenew({ x: fileCenterPosition.centerX, z: fileCenterPosition.centerY })
        }
        // positionlist = res.data.positionlist;
        // let atSquareIndex = 0;
        // 确定所在区域的索引
        // for (let i = 0, len = res.data.waterDepth.length; i < len; i++) {
        //     if (res.data.waterDepth[i].atSquare) {
        //         atSquareIndex = i;
        //         break;
        //     }
        // }
        worker.postMessage({
            cmd: 'Land',
            params: res.data,
        });
    }).catch(err => {
        console.log(err)
    })
}
// 切换地质文件土地数据、更新视野
function changeSolumData(params) {
    requestLand(params).then(function (res) {
        store.dispatch({
            type: 'SET_LOADING',
            data: true,
        });
        fileCenterPosition.centerX = (res.data.maxx + res.data.minx) / 2;
        fileCenterPosition.centerY = (res.data.maxy + res.data.miny) / 2;
        let dataList = [];
        if (res.data.layers.length > 0) {
            for (let i = 0; i < res.data.layers.length; i++) {
                for (let j = 0; j < res.data.layers[i].length; j++) {
                    dataList.push({ X: res.data.layers[i][j].x, Y: res.data.layers[i][j].y, Z: res.data.layers[i][j].layers[0].minDepth })
                }
            }
            updatePerspectivenew({ x: fileCenterPosition.centerX, z: fileCenterPosition.centerY })
        }
        // 确定所在区域的索引
        worker.postMessage({
            cmd: 'solumLand',
            params: dataList,
        });
    }).catch(err => {
        console.log(err)
    })
}
// 更新视角
function updatePerspectivenew(square) {
    console.log("squaresquare")
    camera.position.set((square.x), 800, -(square.z));
    controls.target = new THREE.Vector3(square.x, 0, -square.z);
    controls.update();
}
// 启用场景
function enableScene() {
    window.addEventListener('resize', onWindowResize, false);
    animate();
}

// 停止场景
function stopScene() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (renderer) {
        window.removeEventListener('resize', onWindowResize, false);
    }
    container = null; // 容器赋空
}
// 更新视角
function updatePerspective(vecter, isInit, square) {
    if (isInit) {
        initCenterPosi = vecter;
        controls.target.copy(vecter);
        camera.position.copy(controls.target.clone().add(camera.position));
        // camera.position.set()
        water.position.set(vecter.x, 0, -vecter.z);
    }
    controls.update();
}

function updateWaterPerspective(shipPosition) {
    water.position.set(shipPosition.x, 0, -shipPosition.y);
    controls.update();
}
// ================================================= 切换观察视角事件区域 【开始】 =================================================
let view_way_state = 2;

// 切换相机观察船的视角
function cameraTracking() {
    let v_c_t = camera.position.clone().sub(controls.target); // 相机到控制器的距离
    controls.target.copy(getShipCenter(true, 0)); // 控制器的位置赋值 船对象的中心点位置
    camera.position.copy(controls.target.clone().add(v_c_t)); // 再重新计算相机的位置
    controls.update();
}

// 切换追踪效果
function switchTracking(val) {
    switch (val) {
        case 2:
            // controls.enable = true; // 小马哥原本是让controls.enable的
            controls.enablePan = true;
            controls.autoRotate = false;
            break;
        case 1:
            controls.enablePan = false;
            controls.autoRotate = false;
            break;
        case 3:
            controls.enablePan = false;
            controls.autoRotate = true;
            break;
        default:
            break;
    };
    view_way_state = val;
}
// ================================================= 切换观察视角事件区域 【结束】 =================================================


// ================================================= 切换舱内外视角事件区域 【开始】 =================================================
let inshipCabin = false;

// ================================================= 切换舱内外视角事件区域 【结束】 =================================================

function animate() {
    animationFrame = requestAnimationFrame(animate);
    water.material.uniforms['time'].value += 1.0 / 60.0; // 海水移动
    TWEEN.update();

    if (view_way_state !== 2) cameraTracking();

    // 舱内视角隐藏水
    if (inshipCabin) water.visible = false;
    renderer.render(scene, camera);
    if (inshipCabin) water.visible = true;
    setWinAnimate();
}
function GUID() {
    var d = new Date().getTime();
    var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
        /[xy]/g,
        function (c) {
            var r = (d + Math.random() * 16) % 16 || 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : ((r && 0x7) || 0x8)).toString(16);
        });
    return guid;
};
function changeWaterShow(state) {
    water.visible = state;
}
//夜间返回true，白天返回false，（这里夜间时间设置为23:00 -- 07:00）
function isDaylight() {
    let currdate = new Date();
    if (currdate.getHours() >= 20 || currdate.getHours() < 7) {
        return true;
    } else {
        return false;
    }
}
function changeDayNight(id) {
    if (id === 1) {
        scene.background = new THREE.Color(0x74B8FC);
    } else {
        scene.background = new THREE.Color(0x000000);
    }
}
export {
    GUID,
    scene,
    changeDepth,
    upLandData,
    changeSolumData,
    initScene,
    stopScene,
    switchTracking,
    updatePerspective,
    initCenterPosi,
    updateWaterPerspective,
    changeWaterShow,
    changeDayNight,//改变昼夜
};
