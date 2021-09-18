import * as THREE from '../jsm/three.module.js';

import { controls, transform } from './index';

import { createExtend } from '../ship';

import { saveShipConfig } from '../../requestParent';

let ctrlGroup = new THREE.Group();
ctrlGroup.name = '编辑对象组';

let rayLines = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x00ffff }));
ctrlGroup.add(rayLines);

let transformObject;
let transformArray = [];

let defineFunction = {
    setPositionFun: null,
    setSpacingFun: null,
    setDeviceSelectFun: null,
    setSelectTextFun: null,
};

// 设备
let device = {};

// 创建一个圆锥
function createCone(name) {
    let geometry = new THREE.ConeGeometry(0.5, 2.5, 18);
    geometry.applyMatrix4(new THREE.Matrix4().setPosition(new THREE.Vector3(0, 2.5 / 2, 0)));

    let material = new THREE.MeshLambertMaterial({ color: 0xff00ff });
    let cone = new THREE.Mesh(geometry, material);

    cone.name = name;
    return cone;
}

// 创建一个片
function createSlice(name) {
    let geometry = new THREE.PlaneGeometry(3, 3);
    geometry.applyMatrix4(new THREE.Matrix4().setPosition(new THREE.Vector3(0, 0, 0.05)));

    let material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    let slice = new THREE.Mesh(geometry, material);
    slice.rotation.x = Math.PI / 2;

    slice.name = name;
    return slice;
}

// 创建一个片
function createBox(name) {
    let geometry = new THREE.BoxGeometry(1.5, 1.5, 3);
    geometry.applyMatrix4(new THREE.Matrix4().setPosition(new THREE.Vector3(0, 0.75, 0)));

    let material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    let box = new THREE.Mesh(geometry, material);

    box.name = name;
    return box;
}

// 添加一个新设备
function addEquipment(name, position) {

    let mesh;

    switch (name) {
        case '左耙':
        case '右耙':
        case 'GPS':
            createExtend(name, (object) => {
                object.name = name;
                placeObject(object);
                object.position.y = 0;
                if (name !== 'GPS') setDevice(object, name); // 设置设备信息

                assignPosition(object); // 页面赋值距离的input值
                assignSpacing(object); // 页面赋值间距的input值

                updataDeviceSelects(); // 更新设备选择框
            })
            break;
        case '泥门':
            mesh = createSlice(name);
            break;
        default:
            mesh = createCone(name);
            break;
    }

    if (mesh) {
        placeObject(mesh, position);
        assignPosition(mesh); // 页面赋值距离的input值
        assignSpacing(mesh); // 页面赋值间距的input值
        updataDeviceSelects(); // 更新设备选择框
    }

    // updateRayObject(); // 暂时停止射线
    // assignPosition();

}

// 安置对象
function placeObject(object, position) {

    if (position) {
        object.position.set(position.x, position.y, position.z); // 设置位置为控制器中心位置

    } else {
        setTransformObject(object);  // 设置平移对象
        object.position.copy(controls.target.clone()); // 设置位置为控制器中心位置
    }

    transformArray.push(object); // 添加到控制数组中 【供射线选取等操作】
    ctrlGroup.add(object);
}

// 设置设备信息
function setDevice(object, key) {
    key = key.substring(0, 1);

    let obj = object.children[0];

    device = {
        winch1: object.children[1],
        winch2: object.children[2],
        scaleObj1: obj.getObjectByName(key + '耙臂拉伸1'),
        scaleObj2: obj.getObjectByName(key + '耙臂拉伸2'),
        scaleGroup1: obj.getObjectByName(key + '耙臂拉伸组1'),
        scaleGroup2: obj.getObjectByName(key + '耙臂拉伸组2'),
    }

    // device.winch1PositionX = device.winch1.position.x;
    // device.winch2PositionX = device.winch2.position.x;
    // device.scaleGroup1PositionX = device.scaleGroup1.position.x;
    // device.scaleGroup2PositionX = device.scaleGroup2.position.x;

    if (key === '左') {
        device.winch1PositionX = -16.9;
        device.winch2PositionX = -31.3;
        device.scaleGroup1PositionX = -1507.0322265625;
        device.scaleGroup2PositionX = -845.646240234375;
    } else {
        device.winch1PositionX = -16.95;
        device.winch2PositionX = -31.35;
        device.scaleGroup1PositionX = -1519.681884765625;
        device.scaleGroup2PositionX = -799.174072265625
    }
}

// 指定距离input数值
function assignPosition(object) {
    let { x: d1, y: d2, z: d3 } = object.position

    if (defineFunction.setPositionFun) defineFunction.setPositionFun([
        d1 ? Number(d1.toFixed(2)) : 0,
        d2 ? Number(d2.toFixed(2)) : 0,
        d3 ? Number(d3.toFixed(2)) : 0,
    ], [!d1, !d2, !d3]);
}

// 指定间距input数值
function assignSpacing(object) {
    let array1, array2;
    if (object.name === '左耙' || object.name === '右耙') {
        let d1 = Math.abs(object.children[1].position.x);
        let d2 = (Math.abs(object.children[2].position.x) - d1).toFixed(2) * 1;

        if (defineFunction.setSpacingFun)
            defineFunction.setSpacingFun(
                [d1, d2],
                [!d1, !d2]
            );
        array1 = [d1, d2];
        array2 = [!d1, !d2];
    } else {
        array1 = [0, 0];
        array2 = [true, true];
    }

    if (defineFunction.setSpacingFun)
        defineFunction.setSpacingFun(
            array1,
            array2
        );
}

// 指定下拉框的select内容
function assignSelect(uuid) {
    for (let i = 0, len = transformArray.length; i < len; i++) {
        if (transformArray[i].uuid === uuid) {
            defineFunction.setSelectTextFun(i.toString());
            break;
        }
    }
}

// 设置要控制对象
function setTransformObject(mesh) {
    transformObject = mesh;
    transform.attach(mesh);
}

// 切换平移旋转模式
function transformSetMode(string) {
    if (string === '移动') string = 'translate';
    if (string === '旋转') string = 'rotate';
    transform.setMode(string);
}

// 控制器点击事件
function ctrlClickEvent(mouse) {
    // 通过摄像机和鼠标位置更新射线
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, controls.object);

    var intersect = raycaster.intersectObjects(transformArray, true)[0] || false;
    if (intersect) {
        let object;
        if (intersect.object.originObject) {
            object = intersect.object.originObject;
            if (object.name !== 'GPS') setDevice(object, object.name); // 设置设备信息
        } else {
            object = intersect.object;
        }

        setTransformObject(object);  // 设置平移对象
        assignPosition(object); // 页面赋值距离的input值
        assignSpacing(object); // 页面赋值间距的input值
        assignSelect(object.uuid); // 页面赋值下拉框内容

    }

}

// 控制器控制监听事件
function ctrlTransformEvent() {
    if (transformObject) assignPosition(transformObject);
};

// 平移通过设置位置
function transformBySetPosition(i, v) {
    if (!transformObject) return;
    if (i === 0) transformObject.position.x = v;
    if (i === 1) transformObject.position.y = v;
    if (i === 2) transformObject.position.z = v;
}

// 调整耙得间距
function transformBySetSpacing(i, v) {

    if (v < 8) return;

    let {
        winch1,// 绞车1
        winch2,// 绞车2
        scaleObj1,// 伸缩对象1
        scaleObj2,// 伸缩对象2
        scaleGroup1,// 伸缩组1
        scaleGroup2,// 伸缩组2
        winch1PositionX,// 绞车位置1
        winch2PositionX,// 绞车位置2
        scaleGroup1PositionX,//伸缩组位置1
        scaleGroup2PositionX,//伸缩组位置2
    } = device;

    if (i === 0) {
        // 设置绞车平移 【绞车1的平移是会带动绞车2进行一样的平移】
        let subValue = Math.abs(winch2.position.x - winch1.position.x).toFixed(2) * 1;
        winch1.position.x = - v;
        winch2.position.x = winch1.position.x - subValue; // 绞车2的平移
        // 计算第一节缩放部分的平移
        let offsetValue = (winch1PositionX - winch1.position.x) * 100;
        scaleGroup1.position.x = scaleGroup1PositionX - offsetValue;
        // 计算第一节缩放
        let scaleValue = 1 + offsetValue / 780;
        scaleObj1.scale.x = scaleValue;

    } else if (i === 1) {
        // 设置绞车平移
        winch2.position.x = winch1.position.x - v;
        // 计算第二节缩放部分的平移
        let offsetValue = (winch2PositionX - winch2.position.x - (winch1PositionX - winch1.position.x)) * 100; // 第二节的距离需要在变化差值的基础上再减去第一节的差值距离
        scaleGroup2.position.x = scaleGroup2PositionX - offsetValue;
        // 计算第二节缩放
        let scaleValue = 1 + offsetValue / 450;
        scaleObj2.scale.x = scaleValue;
    }
}

// 保存配置
function saveConfigure() {
    let cfg = {};
    for (const object of transformArray) {
        // , rotation: r
        let { name, position: p } = object;

        if (!cfg[name]) cfg[name] = [];
        // let p = object.position;

        let json = {};
        switch (name) {
            case '左耙':
            case '右耙':
                setDevice(object, name);
                json = {
                    position: p, // 位置
                    winchPosition1: device.winch1.position, // 绞车1位置
                    winchPosition2: device.winch2.position, // 绞车2位置
                    scalePosition1: device.scaleGroup1.position, // 缩放组1位置
                    scalePosition2: device.scaleGroup2.position, // 缩放组2位置
                    scaleValue1: device.scaleObj1.scale.x,// 缩放1值
                    scaleValue2: device.scaleObj2.scale.x,// 缩放2值
                }
                break;

            default:
                break;
        }

        json.position = { x: -p.z, y: p.y, z: p.x }; // 由于旋转关系。x是z的负值，z是x的值
        // json.rotation = { x: -r.z, y: r.y, z: r.x }; // 由于旋转关系。x是z的负值，z是x的值

        cfg[name].push(json);


        // if (!['左耙', '右耙', '泥门'].includes(object.name)) {
        //     let r = object.rotation;
        //     json[object.name].push({
        //         position: { x: p.x.toFixed(2) * 1, y: p.y.toFixed(2) * 1, z: p.z.toFixed(2) * 1 },
        //         rotation: { x: r.x.toFixed(2) * 1, y: r.y.toFixed(2) * 1, z: r.z.toFixed(2) * 1 }
        //     });
        // } else {
        //     json[object.name].push({
        //         position: { x: p.x.toFixed(2) * 1, y: p.y.toFixed(2) * 1, z: p.z.toFixed(2) * 1 },
        //     });
        // }
    }
    console.log(cfg);
    console.log(JSON.stringify(cfg));


    saveShipConfig(JSON.stringify(cfg)); // 保存json 数据到甲方 数据库


    // (x:p.z.toFixed(2) * 1,y:p.y.toFixed(2) * 1,z:-p.x.toFixed(2) * 1)

}

// 设置船的已知信息
function setShipKnownData(data) {
    // console.log(data);

    let name, object;

    for (const key of Object.keys(data)) {
        // console.log(key);
        // console.log(data[key]);
        switch (key) {
            // GPS
            case 'gps':
                for (const position of data[key]) {
                    createExtend(name, (object) => {
                        object.name = 'GPS';
                        setPlaceObject(object, position);
                        updataDeviceSelects(); // 更新设备选择框
                    })
                }
                break;

            // 泥门
            case 'mudGate':
                for (const position of data[key]) {
                    object = createSlice('泥门');
                    setPlaceObject(object, position);
                }
                break;

            // 消能箱
            case 'baffleBox':
                for (const position of data[key]) {
                    object = createBox('消能箱');
                    setPlaceObject(object, position);
                }
                break;

            // 是否吹泥
            case 'bowSpray':
                object = createCone('是否吹泥');
                setPlaceObject(object, data[key]);
                break;

            // 艏吹
            case 'bowBlow':
                object = createCone('艏吹');
                setPlaceObject(object, data[key]);
                break;

            // 左耙
            case 'leftDevice':

                createExtend('左耙', (object) => {
                    object.name = '左耙';
                    setPlaceObject(object, data[key].position);
                    setDevice(object, '左耙');
                    transformBySetSpacing(0, data[key].length1);
                    transformBySetSpacing(1, data[key].length2);

                    updataDeviceSelects(); // 更新设备选择框
                })
                break;

            // 右耙
            case 'rightDevice':
                createExtend('右耙', (object) => {
                    object.name = '右耙';
                    setPlaceObject(object, data[key].position);
                    setDevice(object, '右耙');
                    transformBySetSpacing(0, data[key].length1);
                    transformBySetSpacing(1, data[key].length2);

                    updataDeviceSelects(); // 更新设备选择框
                })
                break;


            default:
                break;
        }


    }

    // console.log(transformArray);
    updataDeviceSelects(); // 更新设备选择框

}

// 设置船已知信息安置对象
function setPlaceObject(object, position) {

    object.position.set(-position.y, position.z, -position.x); // 设置位置为控制器中心位置

    transformArray.push(object); // 添加到控制数组中 【供射线选取等操作】
    ctrlGroup.add(object);
}

// 更新设备下拉框
function updataDeviceSelects(hasRemove = false) {
    // console.log(transformArray);

    // let mapIndex = {};
    let array = [];
    for (let i = 0, len = transformArray.length; i < len; i++) {
        // let name = transformArray[i].name;
        array.push({ v: i, t: transformArray[i].name });
        // if (mapIndex[name]) {
        //     mapIndex[name]++;
        //     array.push({ v: name + mapIndex[name], t: name });
        // } else {
        //     mapIndex[name] = 1;
        //     array.push({ v: name + 1, t: name });
        // }
    }
    // console.log(array);

    defineFunction.setDeviceSelectFun(array, hasRemove);
}

// 外部下拉框选择设备
function selectDeviceByIndex(index) {

    let object = transformArray[index];

    if (object.name === '左耙' || object.name === '右耙') setDevice(object, object.name); // 设置设备信息

    setTransformObject(object);  // 设置平移对象
    assignPosition(object); // 页面赋值距离的input值
    assignSpacing(object); // 页面赋值间距的input值

}

// 删除组件
function deleteTransformObject() {

    if (!transformObject) return;

    transform.detach(); // 从控件中删除当前3D对象

    // 删除
    // transformObject.geometry.dispose();
    // transformObject.material.dispose();

    for (let i = 0, len = transformArray.length; i < len; i++) {
        if (transformArray[i].uuid === transformObject.uuid) {
            transformArray.splice(i, 1);
            break;
        }
    }
    transformObject.parent.remove(transformObject);
    transformObject = null;

    // 清除间距位置等数据
    defineFunction.setPositionFun([0, 0, 0,], [true, true, true]);
    defineFunction.setSpacingFun([0, 0], [true, true]);

    updataDeviceSelects(true); // 更新设备选择框


}
// leftDevice: { // 左耙 
//     position: { x: 0.8, y: 0, z: -44.5 }, // 左耙 位置
//     winchPosition1: { x: -16.95, y: 0, z: -0.23 }, // 绞车1位置
//     winchPosition2: { x: -31.35, y: 0, z: -0.23 }, // 绞车2位置
//     scalePosition1: { x: -1507.0322265625, y: 40.07623291015625, z: -39.986053466796875 }, // 缩放组1位置
//     scalePosition2: { x: -845.646240234375, y: 54.54231262207031, z: 4.93304443359375 }, // 缩放组2位置
//     scaleValue1: 1,// 缩放1值
//     scaleValue2: 1,// 缩放2值

// },
// rightDevice: { // 右耙
//     position: { x: 24.72, y: 0, z: -44.53 }, // 右耙 位置
//     winchPosition1: { x: -16.9, y: 0, z: 0.25 }, // 绞车1位置
//     winchPosition2: { x: -31.3, y: 0, z: 0.25 }, // 绞车2位置
//     scalePosition1: { x: -1519.681884765625, y: 30.11669921875, z: 39.33122253417969 }, // 缩放组1位置
//     scalePosition2: { x: -799.174072265625, y: 70.63876342773438, z: -4.938873291015625 }, // 缩放组2位置
//     scaleValue1: 1,// 缩放1值
//     scaleValue2: 1,// 缩放2值
// },

export {
    defineFunction,
    ctrlGroup,

    addEquipment, // 添加一个对象
    transformSetMode, // 切换模式

    ctrlClickEvent, // 点击监听事件
    ctrlTransformEvent, // 操作监听事件

    transformBySetPosition, // 设置位置
    transformBySetSpacing, // 设置间距
    selectDeviceByIndex, // 外部下拉框选择设备通过索引

    saveConfigure, // 保存配置
    setShipKnownData, // 设置船的配置

    deleteTransformObject, // 删除平移对象
};

// 右耙臂关节2组  》 Cylinder134 

// 计算更新射线
// function updateRayObject(noUpdateInput) {
//     // console.log(transformObject);
//     // console.log(shipGroup);
//     if (!transformObject) return;
//     let origin = transformObject.position.clone();
//     let intersectArray = shipGroup.children[0].children;
//     let intersect_x1 = new THREE.Raycaster(origin, new THREE.Vector3(-1, 0, 0)).intersectObjects(intersectArray, true);
//     let intersect_x2 = new THREE.Raycaster(origin, new THREE.Vector3(1, 0, 0)).intersectObjects(intersectArray, true);
//     let intersect_y1 = new THREE.Raycaster(origin, new THREE.Vector3(0, -1, 0)).intersectObjects(intersectArray, true);
//     let intersect_y2 = new THREE.Raycaster(origin, new THREE.Vector3(0, 1, 0)).intersectObjects(intersectArray, true);
//     let intersect_z1 = new THREE.Raycaster(origin, new THREE.Vector3(0, 0, -1)).intersectObjects(intersectArray, true);
//     let intersect_z2 = new THREE.Raycaster(origin, new THREE.Vector3(0, 0, 1)).intersectObjects(intersectArray, true);

//     let { d: d1, p: p1 } = getRayPoints(intersect_x1, intersect_x2);
//     let { d: d2, p: p2 } = getRayPoints(intersect_y1, intersect_y2);
//     let { d: d3, p: p3 } = getRayPoints(intersect_z1, intersect_z2);

//     updateRayLines(
//         transformObject.position,
//         p1,
//         p2,
//         p3
//     );

//     if (noUpdateInput) return; // 如何不需要更新input内容，则结束

//     if (defineFunction.setPositionFun) defineFunction.setPositionFun([
//         d1 ? Number(d1) : 0,
//         d2 ? Number(d2) : 0,
//         d3 ? Number(d3) : 0,
//     ], [!d1, !d2, !d3]);

// }

// 计算求射线的交点
// function getRayPoints(raycaster1, raycaster2) {
//     if (raycaster1[0] && raycaster2[0]) {
//         if (raycaster1[0].distance < raycaster2[0].distance) {
//             return { d: raycaster1[0].distance.toFixed(2), p: raycaster1[0].point };
//         } else {
//             return { d: raycaster2[0].distance.toFixed(2), p: raycaster2[0].point };
//         }
//     } else if (raycaster1[0]) {
//         return { d: raycaster1[0].distance.toFixed(2), p: raycaster1[0].point };
//     } else if (raycaster2[0]) {
//         return { d: raycaster2[0].distance.toFixed(2), p: raycaster2[0].point };
//     } else {
//         return { d: null, p: null };
//     }
// }

// 更新射线几何体
// function updateRayLines(p, p1, p2, p3) {
//     let points = [];
//     if (p1) points.push(p, p1);
//     if (p2) points.push(p, p2);
//     if (p3) points.push(p, p3);

//     rayLines.geometry.dispose();

//     rayLines.geometry = new THREE.BufferGeometry().setFromPoints(points);

// }

// 平移通过设置位置 【原】
// function transformBySetPosition(i, v) {
//     if (i === 0) {
//         transformObject.position.x += computeOffset(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0), v);
//     } else if (i === 1) {
//         transformObject.position.y += computeOffset(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), v);
//     } else if (i === 2) {
//         transformObject.position.z += computeOffset(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 1), v);
//     }
//     // updateRayObject(true); // 暂时停止射线
// }

// 通过传值来控制组件平移
// function computeOffset(vec1, vec2, v) {
//     let origin = transformObject.position.clone();
//     let intersectArray = shipGroup.children[0].children;

//     let intersect1 = new THREE.Raycaster(origin, vec1).intersectObjects(intersectArray, true);
//     let intersect2 = new THREE.Raycaster(origin, vec2).intersectObjects(intersectArray, true);
//     if (intersect1[0] && intersect2[0]) {
//         if (intersect1[0].distance < intersect2[0].distance) {
//             return v - intersect1[0].distance.toFixed(2);
//         } else {
//             return intersect2[0].distance.toFixed(2) - v;
//         }
//     } else if (intersect1[0]) {
//         return v - intersect1[0].distance.toFixed(2);
//     } else if (intersect2[0]) {
//         return intersect2[0].distance.toFixed(2) - v;
//     }
// }

