//     "罗经",
//     "潮位",
//     "船体吃水",
//     "横倾",
//     "纵倾",
//     "GPS数组",
//     "GPS1X坐标",
//     "GPS1Y坐标",
//     "GPS2X坐标",
//     "GPS2Y坐标",
//     "GPS3X坐标",
//     "GPS3Y坐标",
//     "GPS4X坐标",
//     "GPS4Y坐标",
//     "左耙坐标X",
//     "左耙坐标Y",
//     "左耙坐标Z",
//     "右耙坐标X",
//     "右耙坐标Y",
//     "右耙坐标Z",
//     "是否吹泥",
//     "装舱",
//     "舱内液高",
//     "是否抛泥",
//     "泥门高度",
//     "左耙头吊架内限位",
//     "左耙中吊架内限位",
//     "左管弯吊架内限位",
//     "左耙头吊架外限位",
//     "左耙中吊架外限位",
//     "左管弯吊架外限位",
//     "左耙头绞车上限位",
//     "左耙中绞车上限位",
//     "左管弯绞车上限位",
//     "左耙头搁墩限位",
//     "左耙中搁墩限位",
//     "左弯管搁墩限位",
//     "右耙头吊架内限位",
//     "右耙中吊架内限位",
//     "右管弯吊架内限位",
//     "右耙头吊架外限位",
//     "右耙中吊架外限位",
//     "右管弯吊架外限位",
//     "右耙头绞车上限位",
//     "右耙中绞车上限位",
//     "右管弯绞车上限位",
//     "右耙头搁墩限位",
//     "右耙中搁墩限位",
//     "右弯管搁墩限位",
//     "左吸口到位",
//     "右吸口到位",
//     "左耙上耙管水平角度",
//     "左耙上耙管垂直角度",
//     "左耙下耙管水平角度",
//     "左耙下耙管垂直角度",
//     "右耙上耙管水平角度",
//     "右耙上耙管垂直角度",
//     "右耙下耙管水平角度",
//     "右耙下耙管垂直角度",
//     "左耙浓度",
//     "右耙浓度",
//     "左耙流速",
//     "右耙流速",
//     "左溢流桶行程",
//     "右溢流桶行程",

import store from '../../redux/store';
import { updateSeaLevel } from './3d/scene/water';
import { setGPS as setGPSByLand, dredgingByLand, updateLandByUpFile, solumFileSelect } from './3d/land';
import { message } from 'antd';
import {
    updateDraught, // 更新吃水
    setShipPosition, // 更新船位置
    setShipRotation, // 更新船旋转

    shipEffect, // 船特效
    updateLiquidHigh, // 更新仓液高度
    updateMudGatesHigh, // 更新泥门高度
    getRakeHeadPos, //获取耙头位置
} from './3d/ship';

import {
    rakeAction1, // 耙动作1
    rakeAction2, // 耙动作2
    riseState, // 上升状态
    releaseState, // 外放状态
    actionArm,  // 耙臂旋转 
} from './3d/ship/robotic-arm';

import { updatelookAtObject } from './3d/scene/setWindow';

import { updateEffectCoefficient } from "./3d/effect";
let isrun=false;
let firstTime = true;
let userInfo = {
    userSelfControl: true
}
let solumFiles = "";
let depthColorData = null;
let mockData = [
    0.01278071, 0.300127536058426, 1.746225, 2.5, null, null,
    1234,
    7.92973490006989, 49.077061273448, 0, 0, undefined, undefined, undefined, undefined,
    -5.2973490006989, 55.077061273448, 13,
    28.92973490006989, 55.077061273448, 13,
    1,
    1,
    3,
    0,
    1.5,

    // 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, //  上升
    // 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 内放
    0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 外放
    0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 外放
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, // 外放
    // 0, 0,

    15, 0, 15, -5,
    15, 0, 15, 5,
    null, null, null, null, null, null
];

let System; // 系统标识。用于定义甲方父页面的数据。

// 节点表
let nodeList = [
    "航速",
    "罗经",
    "潮位",
    "船体吃水",
    "横倾",
    "纵倾", //5

    // 船移动参数
    "GPS数组",
    "GPSX坐标",
    "GPSY坐标",
    "GPS2X坐标",
    "GPS2Y坐标",
    "GPS3X坐标",
    "GPS3Y坐标",
    "GPS4X坐标",
    "GPS4Y坐标",//14

    // 挖泥动画参数
    "左耙坐标X",
    "左耙坐标Y",
    "左耙坐标Z",
    "右耙坐标X",
    "右耙坐标Y",
    "右耙坐标Z",//20

    // 艏喷动画
    "是否吹泥",

    // 装舱动画
    "装舱",
    "舱内液高",

    // 抛泥动画
    "是否抛泥",//24
    "泥门高度",//25

    // 耙升降动画
    "左耙头吊架内限位",//26
    "左耙中吊架内限位",//27
    "左弯管吊架内限位",//28
    "左耙头吊架外限位",//29
    "左耙中吊架外限位",//30
    "左弯管吊架外限位",//31
    "左耙头绞车上限位",//32
    "左耙中绞车上限位",//33
    "左弯管绞车上限位",//34
    "左耙头搁墩限位",//35
    "左耙中搁墩限位",//36
    "左弯管搁墩限位",//37

    "右耙头吊架内限位",//38
    "右耙中吊架内限位",//39
    "右弯管吊架内限位",//40
    "右耙头吊架外限位",//41
    "右耙中吊架外限位",//42
    "右弯管吊架外限位",//43
    "右耙头绞车上限位",//44
    "右耙中绞车上限位",//45
    "右弯管绞车上限位",//46
    "右耙头搁墩限位",//47
    "右耙中搁墩限位",//48
    "右弯管搁墩限位",//49


    // 耙管旋转
    "左吸口到位",
    "右吸口到位",//51

    "左耙上耙管垂直角度",
    "左耙上耙管水平角度",//52
    "左耙下耙管垂直角度",
    "左耙下耙管水平角度",


    "右耙上耙管垂直角度",//55
    "右耙上耙管水平角度",
    "右耙下耙管垂直角度",//57
    "右耙下耙管水平角度",


    // 暂时无用参数
    "左耙浓度",
    "右耙浓度",
    "左耙流速",
    "右耙流速",
    "左溢流桶行程",
    "右溢流桶行程",
];
let nodeMap = {};

// GPS信息
let GPSInfo = {
    position: { x: 0, y: 0 },
};

// 特效
let effect = {
    '是否吹泥': 0,
    '装舱': 0,
    '是否抛泥': 0,
    '舱内液高': 0,
};

// 耙信息
let rakeInfo = {
    ready: false,
}

// 设置页面信息
function setDomInfo(data) {
    store.dispatch({
        type: 'SET_SCENE_PAGE_INFO',
        data,
    });
}

// 设置自动执行要查看的对象
function setAutoExecution(num, name) {
    store.dispatch({
        type: 'SET_AUTO_EXECUTION' + num,
        data: name,
    });
}

// 传感器设备管理
function setSensorEquipment(params) {
    store.dispatch({
        type: 'SET_SENSOR_EQUIPMENT',
        data: params,
    });
}

// 设置效果参数
function setEffectParameters(params) {
    store.dispatch({
        type: 'SET_EFFECT_PARAMETERS',
        data: params,
    });
}


// 请求父页面内容
function requestParentData() {
    System = window.parent.System;
    if (System) {
        // 请求父页面的中水深文件数据
        // setTimeout(() => {
        window.parent.getXYZ();
        //     // tick();  //钱鑫调试用,给甲方时删除此行，仅用于模拟船在走
        // }, 10000);
        // 请求可视化管理系统页面保存的数据
        getVisualManageData();
        depthColorData = System.display.colorTable.colors;
        solumFiles = window.parent.System.display.solumFiles;
        // 定时获取船的运作数据
        let nodes = [];// 创建节点 
        for (let i = 0, len = nodeList.length; i < len; i++) {
            nodes.push(System.info.nodes[nodeList[i]]);
        }
        System.comm.socket.addRequestData("3Dhopper" + Math.random(), nodes, setProjectParams);
    }
};

// 请求可视化页面内容
function getVisualManageData() {
    System.comm.ajax.getConfig({
        userId: System.info.userInfo.userId,
        shipId: System.info.shipInfo.id,
        type: 13
    }, function (result) {
        console.log("获取船体信息00", result)
        if (result.status === "ok") {

        }
    });
}

let fistIn = true;

// 右侧窗口信息
let rightWindowInfo = {
    win1: {
        selectName: '自动',
        viewContent: '左耙头',
    },
    win2: {
        selectName: '自动',
        viewContent: '右耙头',
    },
}

let tempAutoExecution; // 当前自动执行
let currentdata;
// 设置项目信息
function setProjectParams(data) {
    currentdata=data;
    // 加工数据
    for (let i = 0, len = data.length; i < len; i++) {
        nodeMap[nodeList[i]] = data[i];
    }
    if (fistIn) {
        fistIn = false;
    }
    try {
        GPSInfo.position.x = Number(nodeMap['GPSX坐标'].toFixed(3));
        GPSInfo.position.y = Number(nodeMap['GPSY坐标'].toFixed(3));
    } catch (error) {

    }
    // 地质
    try {
        setGPSByLand(GPSInfo.position); // 设置地质的GPS
        // 挖泥
    } catch (error) {

    }
    try {
        dredgingByLand(
            {
                raking: nodeMap['左吸口到位'] === 1 || nodeMap['左吸口到位'] === "True",
                position: {
                    x: nodeMap['左耙坐标X'],
                    y: -nodeMap['左耙坐标Y'],
                    z: -nodeMap['左耙坐标Z'],
                }
            },
            {
                raking: nodeMap['右吸口到位'] === 1 || nodeMap['右吸口到位'] === "True",
                position: {
                    x: nodeMap['右耙坐标X'],
                    y: -nodeMap['右耙坐标Y'],
                    z: -nodeMap['右耙坐标Z'],
                }
            }); // 对土地疏浚
    } catch (error) {

    }

    

    // 艏喷动画
    try {
        if (effect['是否吹泥'] !== nodeMap['是否吹泥']) {
            shipEffect('是否吹泥', nodeMap['是否吹泥']);
            effect['是否吹泥'] = nodeMap['是否吹泥'];
            if (effect['是否吹泥'] === 1) tempAutoExecution = '是否吹泥';
        }
    } catch (error) {

    }

    // // 装舱动画
    try {
        if (effect['装舱'] !== nodeMap['装舱']) {
            shipEffect('装舱', nodeMap['装舱']);
            effect['装舱'] = nodeMap['装舱'];
            if (effect['装舱'] === 1) tempAutoExecution = '舱内';
        }
    } catch (error) {

    }

    // 更新舱内液高
    try {
        if (effect['舱内液高'] !== nodeMap['舱内液高']) {
            updateLiquidHigh(nodeMap['舱内液高']);
            effect['舱内液高'] = nodeMap['舱内液高'];
        }
    } catch (error) {

    }


    // 抛泥动画
    try {
        if (effect['是否抛泥'] !== nodeMap['是否抛泥']) {
            shipEffect('是否抛泥', nodeMap['是否抛泥']);
            effect['是否抛泥'] = nodeMap['是否抛泥'];
            if (effect['是否抛泥'] === 1) tempAutoExecution = '泥门';
        }
    } catch (error) {

    }

    // 更新泥门高度
    try {
        if (effect['泥门高度'] !== nodeMap['泥门高度']) {
            updateMudGatesHigh(nodeMap['泥门高度']);
            effect['泥门高度'] = nodeMap['泥门高度'];
        }
    } catch (error) {

    }
    // 耙准备就绪
    if (userInfo.userSelfControl === true && firstTime === true) {
        userControlDevice();

    } else if (firstTime) {
        // 船体移动
        try {
            setShipPosition(GPSInfo);
            // setShipAction(GPSInfo, data[1] * Math.PI / 180); // 船位移和朝向
            // 船体朝向
        } catch (error) {

        }
        try {
            setShipRotation(nodeMap['罗经'] * Math.PI / 180);
        } catch (error) {

        }
        // 水深
        try {
            updateSeaLevel(nodeMap['潮位']); // 设置潮位
        } catch (error) {

        }
        // 船体
        try {
            updateDraught(nodeMap['船体吃水'], nodeMap['潮位']); // 船体吃水
        } catch (error) {

        }
        // 设置页面信息
        try {
            setDomInfo({
                speed: nodeMap['航速'], // 航速
                draft: nodeMap['船体吃水'], // 船体吃水
                course: nodeMap['罗经'],// 航向
                GPS: `(${GPSInfo.position.x},${GPSInfo.position.y})`, // gps
                tidemark: nodeMap['潮位'], // 潮位
            });
        } catch (error) {
            console.log("设置页面信息")
        }
        try {
            if (rakeInfo.ready) {
                rakeWorking(); // 耙工作
                rakearm(nodeMap);
                
            }
        } catch (error) {

        }
    }


    try {
        updateAutoWindow(tempAutoExecution); // 自动窗口
    } catch (error) {

    }

}

function rakearm(nodeMap){
    console.log(nodeMap);
    let type="";
    isrun=true;
    if (nodeMap['左耙上耙管垂直角度']>=90 || nodeMap['左耙上耙管水平角度']>=90 || nodeMap['右耙上耙管水平角度']>=90 || nodeMap['右耙上耙管垂直角度']>=90) 
    {
       console.log("耙角度设定不能大于90度");
    }
    else
    {
      if (nodeMap['左耙上耙管垂直角度']!=null && nodeMap['左耙上耙管水平角度']!=null && nodeMap['右耙上耙管水平角度']!=null && nodeMap['右耙上耙管垂直角度']!=null) 
      {
        var B1=nodeMap['左耙上耙管垂直角度']* Math.PI / 180;  //B1
        var A1=nodeMap['左耙上耙管水平角度']* Math.PI / 180;  //A1
        var B2=nodeMap['左耙下耙管垂直角度']* Math.PI / 180;  //B2
        var A2=nodeMap['左耙下耙管水平角度']* Math.PI / 180;  //A2
        debugger;
        console.log("输出",B1,A1,B2,A2);
        //let B1P=B1,A1P=A1,B2P=B2,A2P=A2;
        //计算弯管旋转角度
        let wg=Math.asin(Math.sin(B1)/Math.cos(A1));
        let B1P=wg;
        let A1P=Math.asin(Math.sin(A1)/Math.cos(B1));
        let B2P=B2;
        let A2P=A1P+Math.asin(Math.sin(A2)/Math.cos(B2));

        var _B1=nodeMap['右耙上耙管垂直角度']* Math.PI / 180;  //B1
        var _A1=nodeMap['右耙上耙管水平角度']* Math.PI / 180;  //A1
        var _B2=nodeMap['右耙下耙管垂直角度']* Math.PI / 180;  //B2
        var _A2=nodeMap['右耙下耙管水平角度']* Math.PI / 180;  //A2
        //let _B1P=_B1,_A1P=_A1,_B2P=_B2,_A2P=_A2;
        //计算弯管旋转角度
        let _wg=Math.asin(Math.sin(_B1)/Math.cos(_A1));
        let _B1P=_wg;
        let _A1P=Math.asin(Math.sin(_A1)/Math.cos(_B1));
        let _B2P=_B2;
        let _A2P=_A1P+Math.asin(Math.sin(_A2)/Math.cos(_B2));
        debugger;
        let rotateDirection = store.getState().rotateDirection;
        if(!rotateDirection){
            //初始化
            store.dispatch({
                type: 'SET_ROTATE_DIRECTION',
                data: {
                 leftHorizontal: 0,
                 leftVertical: 0,
                 rightHorizontal:0,
                 rightVertical:0,
                }
             });
             rotateDirection = store.getState().rotateDirection;
        }
        if (B1P!== rotateDirection.leftVertical ||  _B1P!== rotateDirection.rightVertical) 
        {
            type = 'vertical';
            //判断后对指标进行存储
            store.dispatch({
               type: 'SET_ROTATE_DIRECTION',
               data: {
                leftHorizontal:rotateDirection.leftHorizontal ,
                leftVertical:  B1P,
                rightHorizontal: rotateDirection.rightHorizontal,
                rightVertical:  _B1P
               }
            });
        }
        else if (A1P!== rotateDirection.leftHorizontal || _A1P !== rotateDirection.rightHorizontal) {
            type = 'horizontal';
            //判断后对指标进行存储
            store.dispatch({
                type: 'SET_ROTATE_DIRECTION',
                data: {
                 leftHorizontal: A1P,
                 leftVertical: rotateDirection.leftVertical,
                 rightHorizontal: _A1P,
                 rightVertical: rotateDirection.rightVertical,
                }
             });
        }           
       
        if (nodeMap['左吸口到位'] === 1 || nodeMap['左吸口到位'] === "True") {                
            if (type === 'vertical') actionArm(type, '左', 1,  B1P, 0);
            if (type === 'horizontal') actionArm(type, '左', 1, 0, - A1P);
            //actionArm(type, '左', 2,  B2P-B1P, -(A2P-A1P));  
            actionArm(type, '左', 2,  B2P, -(A2P));              
            actionArm(type, '左', 3, (-nodeMap['左耙活动罩角度']) * Math.PI / 180, 0);
        }
        
        if (nodeMap['右吸口到位'] === 1 || nodeMap['右吸口到位'] === "True") {
            if (type === 'vertical')  actionArm(type, '右', 1,_B1P , 0);
            if (type === 'horizontal')   actionArm(type, '右', 1, 0, _A1P);
            //actionArm(type, '右', 2, _B2P-_B1P , _A2P-_A1P );
            actionArm(type, '右', 2, _B2P , _A2P );
            actionArm(type, '右', 3, (-nodeMap['右耙活动罩角度']) * Math.PI / 180, 0);
        }
      }
    }  
    setTimeout(() => {
        isrun=false;
    }, 500)
}


function userControlDevice() {
    try {
        if (rakeInfo.ready) {
            clearInterval(userControlTimer)
            let states = store.getState().scenePageInfo;
            let gps = { position: { x: states.GPSX, y: states.GPSY } }
            setShipPosition(gps);
            nodeMap['右吸口到位'] = 1;
            nodeMap['左吸口到位'] = 1;
            rakeWorkingJudge('左', '000111000000')
            rakeWorkingJudge('右', '000111000000')
            // 左右耙的耙管的旋转
            actionArm(0, '左', 1, 0, 0);
            actionArm(0, '右', 1, 0, 0);
            actionArm(0, '左', 2, 0, 0);
            actionArm(0, '右', 2, 0, 0);
            setDomInfo({
                speed: Number(Number(states.speed).toFixed(3)), // 航速
                draft: states.draft, // 船体吃水
                course: states.course,// 航向
                GPSX: Number(Number(states.GPSX).toFixed(3)),
                GPSY: Number(Number(states.GPSY).toFixed(3)), // gps
                tidemark: states.tidemark, // 潮位
            });
            updateDraught(states.draft, states.tidemark); // 船体吃水
            updateSeaLevel(states.tidemark); // 设置潮位
            setShipRotation(states.course * Math.PI / 180);// 航向
        }
    } catch (error) {

    }

}
// 更新自动窗口
function updateAutoWindow(name) {

    if (!name) return;
    console.log("自动信号名称", name)
    if (rightWindowInfo.win1.selectName === '自动') {

        if (rightWindowInfo.win1.viewContent !== name) {

            if (name !== "自动" && name === "是否吹泥") {
                message.warning("吹泥信号触发")
            } else if (name !== "自动" && name === "是否抛泥") {
                message.warning("抛泥信号触发")
            } else {
                message.warning(name + "信号触发")
            }
            updatelookAtObject(1, name);
            setAutoExecution(1, name);
            // console.log(rightWindowInfo);
            rightWindowInfo.win1.viewContent = name;
        }
    } else if (rightWindowInfo.win2.selectName === '自动') {
        if (name !== "自动" && name === "是否吹泥") {
            message.warning("吹泥信号触发")
        } else if (name !== "自动" && name === "是否抛泥") {
            message.warning("抛泥信号触发")
        } else {
            message.warning(name + "信号触发")
        }
        if (rightWindowInfo.win2.viewContent !== name) {
            updatelookAtObject(2, name);
            setAutoExecution(2, name);
            rightWindowInfo.win2.viewContent = name;
        }
    }

}

// 耙工作
let leftRakeStr, rightRakeStr;
function rakeWorking() {

    leftRakeStr = '' +
        nodeMap['左耙头吊架内限位'] +
        nodeMap['左耙中吊架内限位'] +
        nodeMap['左弯管吊架内限位'] +
        nodeMap['左耙头吊架外限位'] +
        nodeMap['左耙中吊架外限位'] +
        nodeMap['左弯管吊架外限位'] +
        nodeMap['左耙头绞车上限位'] +
        nodeMap['左耙中绞车上限位'] +
        nodeMap['左弯管绞车上限位'] +
        nodeMap['左耙头搁墩限位'] +
        nodeMap['左耙中搁墩限位'] +
        nodeMap['左弯管搁墩限位'];

    rightRakeStr = '' +
        nodeMap['右耙头吊架内限位'] +
        nodeMap['右耙中吊架内限位'] +
        nodeMap['右弯管吊架内限位'] +
        nodeMap['右耙头吊架外限位'] +
        nodeMap['右耙中吊架外限位'] +
        nodeMap['右弯管吊架外限位'] +
        nodeMap['右耙头绞车上限位'] +
        nodeMap['右耙中绞车上限位'] +
        nodeMap['右弯管绞车上限位'] +
        nodeMap['右耙头搁墩限位'] +
        nodeMap['右耙中搁墩限位'] +
        nodeMap['右弯管搁墩限位'];


    rakeWorkingJudge('左', leftRakeStr)
    rakeWorkingJudge('右', rightRakeStr)

}

let tempRakeState = {};

function xikouToPosi(rake, type) {
    nodeMap[rake + '吸口到位'] = type
}
// 耙工作命令字符串判断
function rakeWorkingJudge(rake, string) {
    if (string === '111000111000') { // 上升
        // 上升位置
        if (!tempRakeState[rake]) {
            riseState(rake); // 耙处于上升状态
            tempRakeState[rake] = '上升';
        } else if (tempRakeState[rake] === '下降') {
            tempRakeState[rake] = '上升';
            rakeAction1('上升', rake);
        }
    } else if (string === '111000000111') { // 下降
        // 归于原位
        if (!tempRakeState[rake]) {
            tempRakeState[rake] = '下降';
        } else if (tempRakeState[rake] === '上升' || tempRakeState[rake] === '内放') {
            tempRakeState[rake] = '下降';
            rakeAction1('下降', rake);
        }

    } else if (string === '111000000000') { // 内放

        // 上升位置
        if (!tempRakeState[rake]) {
            riseState(rake); // 耙处于上升状态
            tempRakeState[rake] = '内放';
        } else if (tempRakeState[rake] === '外放') {
            tempRakeState[rake] = '内放';
            rakeAction2('内放', rake);
        }

    } else if (string === '000111000000') {
        if (nodeMap[rake + '吸口到位'] === 1) { // 外放
            // 下落的位置
            if (!tempRakeState[rake]) {
                console.log("上升状态")
                releaseState(rake); // 耙处于上升状态
                tempRakeState[rake] = '外放';
            } else if (tempRakeState[rake] === '上升' || tempRakeState[rake] === '内放') {
                tempRakeState[rake] = '外放';
                rakeAction2('外放', rake);
                console.log('外放')
            }

        }

    } else {
        // 归于原位
        if (!tempRakeState[rake]) {
            tempRakeState[rake] = '下降';
        }
    }

}

window.setGPSByLand = setGPSByLand;

// 保存船体配置
function saveShipConfig(jsonString) {
    System.comm.ajax.saveConfig({
        config: jsonString, // 保存 json 字符串
        type: 13,
        shipId: System.info.shipInfo.id
    });
}

// 请求船体保存的数据
function getShipSaveConfig(params) {
    System.comm.ajax.getConfig({
        userId: System.info.userInfo.userId,
        shipId: System.info.shipInfo.id,
        type: 13
    }, function (result) {
        if (result.status === "ok") {
            return result;
        }
    });
}

// 请求船的参数信息 【读取船的各种参数信息】
// scalePosition2 下耙
// scalePosition1 上耙
// winchPosition1 第一个角车
// winchPosition2 第二个角车
// scalePosition1 第一个轿车的耙管
function requestShipInfo(callback) {
    let mockData = {
        "艏吹": [{ "position": { "x": 12.8, "y": 6.11, "z": -136.55 } }], "是否吹泥": [{ "position": { "x": 11.11, "y": 11.1, "z": -136.55 } }], "消能箱": [{ "position": { "x": 7.4, "y": 1.73, "z": -82.19 } }, { "position": { "x": 18.53, "y": 1.73, "z": -82.19 } }, { "position": { "x": 15.58, "y": 2.1, "z": -51.95 } }, { "position": { "x": 9.94, "y": 2.1, "z": -51.95 } }], "泥门": [{ "position": { "x": 5.87, "y": -10.15, "z": -94.47 } }, { "position": { "x": 19.61, "y": -10.15, "z": -94.47 } }, { "position": { "x": 5.87, "y": -10.15, "z": -86.74 } }, { "position": { "x": 19.61, "y": -10.15, "z": -86.74 } }, { "position": { "x": 5.87, "y": -10.15, "z": -79.11 } }, { "position": { "x": 19.61, "y": -10.15, "z": -79.11 } }, { "position": { "x": 5.87, "y": -10.15, "z": -71.38 } }, { "position": { "x": 19.61, "y": -10.15, "z": -71.38 } }, { "position": { "x": 5.87, "y": -10.15, "z": -63.76 } }, { "position": { "x": 19.61, "y": -10.15, "z": -63.76 } }, { "position": { "x": 5.87, "y": -10.15, "z": -56.07 } }, { "position": { "x": 19.61, "y": -10.15, "z": -56.07 } }, { "position": { "x": 5.87, "y": -10.15, "z": -48.39 } }, { "position": { "x": 19.61, "y": -10.15, "z": -48.39 } }],
        "左耙": [
            {
                "position": { "x": 0.8, "y": 0, "z": -44.53 },
                "winchPosition1": { "x": -15, "y": -0.031373415142297745, "z": -0.25 },
                "winchPosition2": { "x": -30, "y": -0.031373415142297745, "z": -0.25 },
                "scalePosition1": { "x": -1507, "y": 40.07623291015625, "z": -39.33122253417969 }, //上耙位置
                "scalePosition2": { "x": -845, "y": 54.54231262207031, "z": 4.938873291015625 }, //下耙位置
                "scaleValue1": 1,
                "scaleValue2": 1
            }],
        "GPS": [{ "position": { "x": 0, "y": 0, "z": 0 } }],
        "右耙": [
            {
                "position": { "x": 24.72, "y": 0, "z": -44.53 },
                "winchPosition1": { "x": -15, "y": -0.031373415142297745, "z": 0.25 },
                "winchPosition2": { "x": -30, "y": -0.031373415142297745, "z": 0.25 },
                "scalePosition1": { "x": -1519, "y": 30, "z": 39.33122253417969 },
                "scalePosition2": { "x": -797, "y": 70.6, "z": -5.2 },
                "scaleValue1": 1,
                "scaleValue2": 1
            }]
    }
    System = window.parent.System;
    callback(mockData);
}

// 请求船的参数信息 【读取船的各种参数信息】
function requestShipKnownInfo(callback) {
    System = window.parent.System;
    if (System) {
        let mockData = {
            shipName: 'modelDraco', // 船的模型名字
            gps: [ // GPS的个数和位置
                { x: 10, y: 10, z: 2 },
                { x: 8, y: 8, z: 5 },
                { x: 5, y: 0, z: 0 },
                { x: 0, y: 5, z: 0 },
            ],
            leftDevice: { // 左设备 
                position: { x: 0.8, y: 44.5, z: 0 }, // 左设备 位置
                length1: 15,
                length2: 15,
            },
            rightDevice: { // 右设备
                position: { x: 24.72, y: 44.53, z: 0 }, // 右设备 位置
                length1: 15,
                length2: 15,
            },
            bowBlow: { // 艏吹
                x: 12.80, y: 136.55, z: 6.11,
            },
            bowSpray: { // 是否吹泥
                x: 11.11, y: 136.55, z: 1,
            },
            baffleBox: [ // 消能箱 【顶喷】
                { x: 7.4, y: 82.19, z: 1.73 },
                { x: 18.53, y: 82.19, z: 1.73 },
                { x: 15.58, y: 51.95, z: 2.1 },
                { x: 9.94, y: 51.95, z: 2.1 },

            ],
            mudGate: [ // 泥门 
                { x: 5.87, y: 94.47, z: -10.15 }, { x: 19.61, y: 94.47, z: -10.15 },
                { x: 5.87, y: 86.74, z: -10.15 }, { x: 19.61, y: 86.74, z: -10.15 },
                { x: 5.87, y: 79.11, z: -10.15 }, { x: 19.61, y: 79.11, z: -10.15 },
                { x: 5.87, y: 71.38, z: -10.15 }, { x: 19.61, y: 71.38, z: -10.15 },
                { x: 5.87, y: 63.76, z: -10.15 }, { x: 19.61, y: 63.76, z: -10.15 },
                { x: 5.87, y: 56.07, z: -10.15 }, { x: 19.61, y: 56.07, z: -10.15 },
                { x: 5.87, y: 48.39, z: -10.15 }, { x: 19.61, y: 48.39, z: -10.15 },
            ]
        }
        callback(mockData);
    }
}

let userControlTimer;
let userDragTimer;
function userTimer() {
    System = window.parent.System;
    if (System) {
        // 请求父页面的中水深文件数据
        // setTimeout(() => {
        window.parent.getXYZ();
        //     // tick();  //钱鑫调试用,给甲方时删除此行，仅用于模拟船在走
        // }, 10000);
        // 请求可视化管理系统页面保存的数据
        getVisualManageData();
        depthColorData = System.display.colorTable.colors;
        solumFiles = window.parent.System.display.solumFiles;
    }
    userControlTimer = setInterval(() => {
        userControlDevice();
    }, 1000);
    userDragTimer = setInterval(() => {
        try {
            if (rakeInfo.ready) {
                let leftPos = getRakeHeadPos('左');
                let rightPos = getRakeHeadPos('右');
                dredgingByLand(
                    {
                        raking: true,
                        position: {
                            x: leftPos.x,
                            y: leftPos.z,
                            z: -(leftPos.y-2),
                        }
                    },
                    {
                        raking: true,
                        position: {
                            x: rightPos.x,
                            y: rightPos.z,
                            z: -(rightPos.y-2),
                        }
                    }); // 对土地疏浚
            }
        } catch (error) {
        }
    }, 1000);
}
export {
    rightWindowInfo, // 右边的窗口数据变量
    rakeInfo, // 耙的信息
    GPSInfo, // gps的信息
    nodeList,
    currentdata,
    requestParentData, // 请求甲方的系统数据
    requestShipInfo, // 请求船信息
    requestShipKnownInfo, // 请求船已知信息
    rakearm,
    saveShipConfig, // 保存船体数据
    getShipSaveConfig, // 请求船体保存数据
    setProjectParams,
    solumFiles,
    depthColorData, //
    rakeWorkingJudge,
    xikouToPosi,
    userInfo,
    userTimer
}
/**
 * 通知3D
 * @param {*} xyzFilesname 水深文件名 "202000222-水深格式"
 * @param {*} isnow 是否是 实时0 或 历史1
 * @param {*} startime 播放历史的开始时间 "2020/07/20 11:12:25"
 */
window.notify3D = (xyzFilesname, solumFileName, startime) => {
    console.log("xyzFilesname")
    console.log(xyzFilesname, solumFileName, startime);

    if (xyzFilesname[0].length > 0) {
        updateLandByUpFile(xyzFilesname[0], xyzFilesname[1], GPSInfo.position);//两次请求
    } else {
        console.log("waterFile is Null")
    }
    if (solumFileName[0].length > 0) {
        solumFileSelect(solumFileName[0], solumFileName[1]);//两次请求
    } else {
        console.log("waterFile is Null")
    }
    // 重新刷新页面
    // window.location.reload();
}
