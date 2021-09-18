import * as THREE from '../jsm/three.module.js';
import { TWEEN } from '../jsm/libs/tween.module.min.js';

import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';

import { updatePerspective } from '../scene';
import { requestShipInfo } from '../../requestParent';
import { requestShipObject } from '../scene/setWindow';
import { Spray, Curtains, Mud } from '../effect';
import { initRakeParams } from './robotic-arm';

// gltf,draco Loader
let loader = new GLTFLoader()
    .setDRACOLoader(  // gltf加载器设置draco加载
        new DRACOLoader() // 创建draco加载器对象
            .setDecoderPath('./libs/draco/') // draco配置地址
    );

let shipGroup, expandGroup; // 船组 扩展组
let successedCallback; // 成功的回调

let loadShipStep = 0; // 船加载进程数

let shipEquipment = {
    '舱内': null,
    '艏吹': null,
    '是否吹泥': null,
    '泥门': null,
};
let leftDevice, rightDevice,winch;
let effectObjects = {};

// 排除名单
let exclusionList = [
    'GRTY_PS_DH_016',
    'GRTY_PS_MID_00',
    'GRTY_PS_DH_00',
    'GRTY_PS_DH_008',
    'GRTY_PS_WG_04',
    'GRTY_PS_WG_09',
    'GRTY_PS_WG_022',
    'GRTY_PS_WG_018',
];

let GPSData = {
    1: { x: 0, y: 0, z: 0 }
}

// 遍历对象修改材质
function traverseObject(object) {
    object.traverse(function (o) {
        if (o.isMesh) {
            if (!o.material[0]) {
                o.material.side = 0;
                o.material.vertexColors = 0;
                o.material.roughness = o.material.metalness = 0.5;
                o.material.flatShaded = true;
                // o.material.transparent = false;
                if (o.material.transparent) {
                    o.material.map.wrapS = o.material.map.wrapT = THREE.RepeatWrapping;
                    o.material.isTransparent = true;
                }

                // 对泥仓处理，如果需要，随后的模型中应该固定叫法，避免无法实现
                if (o.name === 'nicang_BOX') {

                    o.visible = false;
                    o.material.transparent = true;
                    o.material.isTransparent = true;

                    o.material.notOpacity = true;
                    o.material.opacity = 0.03;
                    // console.log(o);

                }
                o.material.needsUpdate = true;

            } else {
                let mlen = o.material.length;
                for (let i = 0; i < mlen; i++) {
                    let m = o.material[i];
                    m.side = 0;
                    m.vertexColors = 0;
                    m.flatShaded = true;
                    m.needsUpdate = true;
                    // m.transparent = false;
                    if (m.material.transparent) {
                        m.material.isTransparent = true;
                    }
                    m.roughness = m.metalness = 0.5;

                }
            }
        }
    })
};

// 排除
function exclusionObject(object) {
    let ii = object.children.length;

    while (ii--) {
        const obj = object.children[ii];
        if (exclusionList.includes(obj.name)) {
            // 仅排除，不考虑disponse
            // obj.material.dispose();
            // obj.geometry.dispose();
            object.remove(obj);
        }
    }

}

// 创建船对象
function initShip(callback) {

    if (!shipGroup) {

        // 创建船组
        shipGroup = new THREE.Group();
        shipGroup.name = '船对象组';
        shipGroup.visible = false;

        // 创建扩展组
        expandGroup = new THREE.Group();
        expandGroup.name = '船扩展组';
        shipGroup.add(expandGroup);
        // Math.atan2(y,x); // 来决定船得角度
        // shipGroup.rotation.y = -Math.PI;
        // shipGroup.position.y += 3; 
        requestShipInfo(requestShipData); // 请求船体数据

        successedCallback = callback; // 设置加载成功回调函数

        // loadShip(callback); // 创建船体
        // loadExpand(callback); // 创建附加信息
    }

    return shipGroup;
}

// 请求船体数据
function requestShipData(data) {

    // console.log(data);

    shipEquipment['艏吹'] = data['艏吹'][0].position;
    shipEquipment['是否吹泥'] = data['是否吹泥'][0].position;

    let bowSprayPosition = data['是否吹泥'][0].position;

    // 是否吹泥
    let bowSpray = new Spray();
    effectObjects['是否吹泥'] = bowSpray;
    bowSpray.object.position.set(bowSprayPosition.x, bowSprayPosition.y, bowSprayPosition.z);
    shipGroup.add(bowSpray.object);

    // 装舱
    let curtains = new Curtains(data['消能箱']);
    effectObjects['装舱'] = curtains;
    shipGroup.add(curtains.object);

    // 是否抛泥
    let mud = new Mud(data['泥门']);
    effectObjects['是否抛泥'] = mud;
    shipGroup.add(mud.object);
    creteMudGates(data['泥门']); // 创建泥门

    // 冲舱口
    // let watering = new Watering(getWaterArray());
    // effectObjects['冲舱口'] = watering.object;
    // console.log(watering.object);
    // shipGroup.add(effectObjects['冲舱口']);

    // 加载船体
    loadExpand(data);
    
    loadShip(data.shipName);
}

// 加载船
function loadShip(shipName) {
    loader.load(
        // `./models/${shipName}.glb`,
        './models/modelDraco.glb',
        function (gltf) {
            let object = gltf.scene.children[0];
            traverseObject(object); // 格式化模型效果
            exclusionObject(object); // 排除多余的零件，【船模型中吊架，绞车位置利用原有模型做位置确定使用并不显示，故而排除，随后船模型中不带有该数据，该行代码删除】
            shipGroup.add(object);

            loadShipStep++;

            if (loadShipStep === 2) {
                if (successedCallback) successedCallback();
                successedFunc();
            }
        },
    );
}
// 添加设备
function addDevice(params) {
    let { deviceName, deviceParams } = params;
    let {
        position,
        winchPosition1,
        winchPosition2,
        scalePosition1,
        scalePosition2,
        scaleValue1,
        scaleValue2,
    } = deviceParams;
    let group = new THREE.Group();

    group.position.set(position.x, position.y, position.z);
    group.rotation.y = Math.PI / 2;
    group.name = deviceName + '耙组';
    expandGroup.add(group);


    let obj1;
    let rad;

    if (deviceName === '左') {
        obj1 = leftDevice.clone();
        rad = Math.PI;
    } else {
        obj1 = rightDevice.clone();
        rad = 0;
    }

    let obj2 = winch.clone();
    obj2.name = deviceName + '绞车1';
    let obj3 = winch.clone();
    obj3.name = deviceName + '绞车2';

    obj2.position.add(new THREE.Vector3(winchPosition1.x, winchPosition1.y, winchPosition1.z));
    obj3.position.add(new THREE.Vector3(winchPosition2.x, winchPosition2.y, winchPosition2.z));

    obj2.rotation.z = obj3.rotation.z = rad;

    // 设置拉伸信息
    obj1.getObjectByName(deviceName + '耙臂拉伸组1').position.set(
        scalePosition1.x, scalePosition1.y, scalePosition1.z
    );
    obj1.getObjectByName(deviceName + '耙臂拉伸组2').position.set(
        scalePosition2.x, scalePosition2.y, scalePosition2.z
    );
    obj1.getObjectByName(deviceName + '耙臂拉伸1').scale.x = scaleValue1;
    obj1.getObjectByName(deviceName + '耙臂拉伸2').scale.x = scaleValue2;
    group.add(obj1);
    group.add(obj2);
    group.add(obj3);
}
// 扩展组
function loadExpand(params) {
    console.log("params",params)
    let GPS; // 绞车 左吊架 右吊架 GPS
    loader.load(
        './models/extendDraco.glb',
        function (gltf) {

            traverseObject(gltf.scenes[0]);

            winch = gltf.scenes[0].children[0];
            leftDevice = gltf.scenes[0].children[1];
            rightDevice = gltf.scenes[0].children[2];
            GPS = gltf.scenes[0].children[3];

            // 左耙
            if (params['左耙']) {
                addDevice({
                    deviceName: '左',
                    deviceParams: params['左耙'][0],
                })
            }

            // 右耙
            if (params['右耙']) {
                addDevice({
                    deviceName: '右',
                    deviceParams: params['右耙'][0],
                })
            }

            // gps
            // for (let i = 0; i < params['GPS'].length; i++) {

                const { x, y, z } = params['GPS'][0].position;

                GPSData[0] = { x, y, z };

                let obj = GPS.clone();
                obj.position.set(x, y, z);
                expandGroup.add(obj);

            // }
            // if (params.gps) {
            //     for (const list of params.gps) {
            //         let obj = GPS.clone();
            //         obj.position.set(list.x, list.y, -list.z);
            //         expandGroup.add(obj);
            //     }
            // }

            loadShipStep++;

            if (loadShipStep === 2) {
                if (successedCallback) successedCallback();
                successedFunc();
            }

        },
    );
}

// 船透明化
function transparentShip(boolean) {
    let opacity = 0.5;
    shipGroup.traverse(function (o) {
        if (o.isMesh) {
            if (!o.material[0]) {
                if (!o.material.notOpacity) {
                    o.material.opacity = boolean ? opacity : 1;
                }
                if (!o.material.isTransparent) {
                    o.material.transparent = boolean;
                    o.material.depthTest = !boolean;
                    o.material.depthWrite = !boolean;
                }
            } 
            else {
                let mlen = o.material.length;
                for (let i = 0; i < mlen; i++) {
                    let m = o.material[i];
                    if (!m.material.notOpacity) {
                        m.material.opacity = boolean ? opacity : 1;
                    }
                    if (!m.material.isTransparent) {
                        m.material.transparent = boolean;
                        m.depthTest = !boolean;
                        m.depthWrite = !boolean;
                    }
                }
            }
        }
    })
    shipGroup.traverse(function (o) {
        if (o.isMesh) {
            if(o.name === "左耙臂吊点1" || o.name === "左耙臂拉伸1" || o.name === "左耙臂拉伸2" || o.name === "右耙臂吊点1" || o.name === "右耙臂拉伸1" || o.name === "右耙臂拉伸2"){
                o.material.opacity = 1;
                o.material.transparent = true;
            }
        }
    })
    
}

// 获取船的中心坐标
function getShipCenter(setY, value) {
    let box = new THREE.Box3().setFromObject(shipGroup);
    let centerVecter = new THREE.Vector3();
    box.getCenter(centerVecter);
    if (setY) centerVecter.y = value; // 如果指定高度，则返回指定高度
    return centerVecter;
}

// 加载成功执行函数
function successedFunc() {
    const { x, y, z } = getShipCenter();

    shipGroup.centerOffsetY = y; // 定义船的中心点位置，用于观察船的位置

    createLiquidHigh(shipGroup.getObjectByName('nicang_BOX')); // 创建舱液体

    // 设置船的位置旋转等信息
    const { position, rotationY, draughtValue } = tempShipInfo;
    shipGroup.rotation.y = rotationY;
    // shipGroup.rotation.y = Math.PI / 2;
    shipGroup.position.set(position.x, shipGroup.centerOffsetY + draughtValue, position.z);

    updatePerspective(getShipCenter(true, 0),true); // 更新相机位置

    shipGroup.visible = true; // 显示船体

    shipGroup.updateMatrixWorld(true); // 更新世界矩阵

    shipEquipment['舱内'] = { x, y: y / 2, z };
    shipEquipment['泥门'] = { x, y: -2 * y, z };

    initRakeParams(); // 初始化设置耙臂的数据参数

    requestShipObject(); // 右边小窗口 请求船体对象 数据
}

// 创建仓液对象
function createLiquidHigh(obj) {

    let box = new THREE.Box3().setFromObject(obj);
    let centerVecter = new THREE.Vector3();
    box.getCenter(centerVecter);

    let width = box.max.x - box.min.x,
        height = box.max.y - box.min.y,
        lenght = box.max.z - box.min.z;

    let cube = new THREE.Mesh(
        new THREE.BoxGeometry(width, .1, lenght),
        new THREE.MeshBasicMaterial({
            color: 0xdeb887,
            transparent: true,
            opacity: 0.3,
        })
    );

    cube.name = '舱液对象';
    // console.log(cube.geometry);
    cube.widthValue = width;
    cube.lenghtValue = lenght;
    // centerVecter.y -= height / 2 + 3;
    // console.log(cube);

    cube.position.copy(centerVecter);
    cube.position.y -= height / 2 + 3;
    cube.originPositionY = cube.position.y;
    // console.log(cube.position.clone());

    cube.material.isTransparent = true;
    cube.material.notOpacity = true;
    // {x: 12.750279401867566, y: 2.4520739880178937, z: -68.645591822196}

    shipGroup.add(cube);
}

// 创建泥门组对象
function creteMudGates(array) {
    let mudGatesGroup = new THREE.Group(); // 泥组
    mudGatesGroup.name = '泥门组';
    for (let i = 0; i < array.length; i++) {
        const { x, y, z } = array[i].position;

        let geometry = new THREE.ConeGeometry(2, 2.5, 18);
        geometry.applyMatrix4(new THREE.Matrix4().setPosition(new THREE.Vector3(0, 2.5 / 2, 0)));

        let material = new THREE.MeshPhongMaterial({ color: 0x25120c });
        let cone = new THREE.Mesh(geometry, material);
        cone.position.set(x, y, z);

        mudGatesGroup.add(cone);
    }
    shipGroup.add(mudGatesGroup);
}

// 临时的船的信息对象
let tempShipInfo = {
    position: { x: 0, y: 0, z: 0 }, // 船位置
    rotationY: 0, // 船朝向
    lastPosition: null, // 船上次的位置
    draughtValue: 0, // 船吃水深度
};

// 设置船的行动
function setShipAction({ position }) {

    position.y = -position.y;

    // 设置实际船得位置
    const { x, z } = GPSData[0];
    position.x -= x;
    position.y -= z;

    if (loadShipStep === 2 && tempShipInfo.lastPosition) {

        new TWEEN.Tween(tempShipInfo.lastPosition)
            .to(position, 1000)
            .start()
            .onUpdate(function () { // 更新时执行的回调
                let obj = this._object;
                shipGroup.position.x = obj.x;
                shipGroup.position.z = obj.y;
            })
            .onComplete(() => { // 结束时执行的回调
            });
    } else {
        tempShipInfo.position.x = position.x;
        tempShipInfo.position.z = position.y;
        tempShipInfo.lastPosition = { ...position };
    }

}

// 更新船体吃水深度
function updateDraught(value,chaowei) {
    if (loadShipStep === 2 && shipGroup.centerOffsetY) {
        shipGroup.position.y = chaowei-value+10.12274;
    } else {
        tempShipInfo.draughtValue = -9.62755;
    }
}


// 设置船的位置 船的位置减去GPS位置
function setShipPosition({ position }) {

    position.y = -position.y;

    // 设置实际船得位置
    const { x, z } = GPSData[0];
    position.x -= x;
    position.y -= z;

    if (loadShipStep === 2 && tempShipInfo.lastPosition) {

        new TWEEN.Tween(tempShipInfo.lastPosition)
            .to(position, 1000)
            .start()
            .onUpdate(function () { // 更新时执行的回调
                let obj = this._object;
                shipGroup.position.x = obj.x;
                shipGroup.position.z = obj.y;
            })
            .onComplete(() => { // 结束时执行的回调
            });
    } else {
        tempShipInfo.position.x = position.x;
        tempShipInfo.position.z = position.y;
        tempShipInfo.lastPosition = { ...position };
    }

}

// 设置船的旋转
function setShipRotation(rotationY) {
    if (loadShipStep === 2) {
        shipGroup.rotation.y = rotationY;
    } else {
        tempShipInfo.rotationY = rotationY;
    }
}

// 船的特效
function shipEffect(key, status) {
    if (status === 0) {
        effectObjects[key].disable();
    } else {
        effectObjects[key].enable();
    }
}

// 更新船的仓液高
function updateLiquidHigh(value) {
    if (loadShipStep === 2) {
        console.log(value);
        let obj = shipGroup.getObjectByName('舱液对象');
        console.log('舱液对象', obj);

        let geo = obj.geometry;
        for (let i = 0; i < geo.vertices.length; i++) {
            let vec = geo.vertices[i];
            if (i === 0 || i === 1 || i === 4 || i === 5) {
                vec.y = value / 2;
            } else {
                vec.y = -value / 2;
            }
        }
        geo.verticesNeedUpdate = true;
        obj.position.y = obj.originPositionY + value / 2;
    }
};

// 更新泥门高度
function updateMudGatesHigh(value) {
    if (loadShipStep === 2) {
        console.log(value);
        console.log(shipGroup.getObjectByName('泥门组'));
        shipGroup.getObjectByName('泥门组').position.y = -value;
    }
}


// ===========================================================船动画部分===========================================================

// ===========================================================以下部分属于创建船体环节===========================================================
let configShip = {
    shipModel: null,// 船主体模型
    winch: null, // 绞车
    leftDevice: null, // 左吊架
    rightDevice: null, // 右吊架
    GPS: null, // GPS
}
let loadedExtend2 = false;

// 遍历对象修改材质 【用于吊车点击时候，显示得为原吊车组对象】
function traverseObject2(object) {
    object.traverse(function (o) {
        if (o.isMesh) {
            o.originObject = object;
        }
    })
};

// 加载船
function loadShip2(parentGroup, callback) {

    // 加载模型
    loader.load(
        './models/modelDraco.glb',
        function (gltf) {

            traverseObject(gltf.scene); // 格式化船体

            configShip.shipModel = gltf.scene.children[0];
            parentGroup.add(configShip.shipModel);

            if (callback) callback();
        });
}

// 加载额外动作部件
function loadExtend2(callback) {

    loader.load(
        './models/extendDraco.glb',
        function (gltf) {

            traverseObject(gltf.scene); // 格式化扩展组件

            configShip.winch = gltf.scenes[0].children[0];
            configShip.leftDevice = gltf.scenes[0].children[1];
            configShip.rightDevice = gltf.scenes[0].children[2];
            configShip.GPS = gltf.scenes[0].children[3];

            loadedExtend2 = true;

            callback();

        },
    );

}

// 添加一艘船
function addShip(parentGroup, callback) {
    if (configShip.shipModel) {
        parentGroup.add(configShip.shipModel);
        callback();
    } else {
        loadShip2(parentGroup, callback); // 加载并赋值
    }
}

// 添加额外的设备
function addExtend(name, callback) {

    let object;

    if (name === 'GPS') {
        object = configShip.GPS.clone();
    } else {

        let { winch, leftDevice, rightDevice } = configShip;

        object = new THREE.Group();
        object.rotation.y = Math.PI;

        let winch1 = winch.clone();
        let winch2 = winch.clone();

        winch1.name = name + '绞车1';
        winch2.name = name + '绞车2';

        let device; // 定义设备变量

        if (name === '左耙') {
            device = leftDevice.clone();
            // winch1.position.add(new THREE.Vector3(-16.95, 0, -0.23));
            // winch2.position.add(new THREE.Vector3(-31.35, 0, -0.23));
            winch1.position.add(new THREE.Vector3(-16.9, 0, -0.25));
            winch2.position.add(new THREE.Vector3(-31.3, 0, -0.25));
            winch1.rotation.z = winch2.rotation.z = Math.PI;
        } else if (name === '右耙') {
            device = rightDevice.clone();
            // winch1.position.add(new THREE.Vector3(-16.95, 0, -0.23));
            // winch2.position.add(new THREE.Vector3(-31.35, 0, -0.23));
            winch1.position.add(new THREE.Vector3(-16.9, 0, 0.25));
            winch2.position.add(new THREE.Vector3(-31.3, 0, 0.25));
        }

        object.add(device);
        object.add(winch1);
        object.add(winch2);

    }

    traverseObject2(object);

    if (callback) callback(object);
}

// 创建额外设备
function createExtend(name, callback) {
    if (loadedExtend2) {
        addExtend(name, callback)
    } else {
        loadExtend2(() => {
            addExtend(name, callback)
        });
    }
}

function changTubeLenght(type,upDown,value,addOrReduce){
    if(upDown === "下"){
        //将下耙整数零时保存
        // 由于是长度倍数，所以除以原始长度1.594/7.8。得到下耙的实际长度
        // 输入的是倍数，同样需要转换value/7.8
        expandGroup.getObjectByName(type+'耙臂拉伸'+2).scale.x = (value-7.25558)/4.51;
        if(type === '左'){
            // 左右下耙耙臂位置
            expandGroup.getObjectByName(type+'耙臂拉伸组2').position.set(
                -395-(value-7.28558)*100, 55.8, 4.4
            );
        }else{
            expandGroup.getObjectByName(type+'耙臂拉伸组2').position.set(
                -346-(value-7.25558)*100, 70.8, -4.938873291015625
            );
        }
    }else{
        expandGroup.getObjectByName(type+'耙臂拉伸'+1).scale.x = (value-13.61488)/7.81;
        let tempY = expandGroup.getObjectByName(type+'耙臂拉伸组1').position.y;
        let tempZ = expandGroup.getObjectByName(type+'耙臂拉伸组1').position.z;
        // 左右上耙
        if(type === '左'){
            expandGroup.getObjectByName(type+'耙臂拉伸组1').position.set(
                -726-((value-13.61488)*100), tempY, tempZ
            );
        }else{
            expandGroup.getObjectByName(type+'耙臂拉伸组1').position.set(
                -739-((value-13.62488)*100), tempY, tempZ
            );
        }
    }
    
}

function autoSetAngle(depth, l1, l2, type){
    let angle=null;
    if(type === 0){
        if(Number(depth)/(l1+l2)>0 && Number(depth)/(l1+l2)<1){
            angle = (180/Math.PI)*Math.acos(Number(depth)/(l1+l2));//弧度
            return 90-angle;
        }
    }
}

function getLeftSuction(params) {
    
}
function getRightSuction(params) {
    
}
function getRakeHeadPos(key='左') {
    let obj = expandGroup.getObjectByName(key+'耙头组');
    obj.updateMatrixWorld();
    let vector =new THREE.Object3D();
    vector.applyMatrix4( obj.matrixWorld );
    return vector.position
}
export {
    shipGroup, // 船组
    shipEquipment, // 船设备
    GPSData, // GPS数组
    initShip, transparentShip, addShip, createExtend,
    setShipAction, // 设置船的行动
    updateDraught, // 设置船体吃水
    getShipCenter, // 请求船体的中心坐标

    setShipPosition, // 设置船移动
    setShipRotation, // 设置船旋转

    shipEffect, // 船特效
    updateLiquidHigh, // 更新仓液高度
    updateMudGatesHigh, // 更新泥门高度
    addDevice,
    changTubeLenght,//更新耙管长度
    autoSetAngle,
    getRakeHeadPos
};
