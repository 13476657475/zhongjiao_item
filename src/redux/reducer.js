import { combineReducers } from 'redux';

// 设置场景页面的信息
let initScenePageInfo = {
    speed: 1, // 航速
    draft: 2.56, // 船体吃水
    course: 0,// 航向
    GPSX: 0.000, // gps
    GPSY: 0.000,
    tidemark: 0, // 潮位
}

// 设置场景页的信息
function setScenePageInfo(state = initScenePageInfo, action) {
    switch (action.type) {
        case 'SET_SCENE_PAGE_INFO':
            return {
                ...action.data,
            };
        default:
            return state;
    }
}

// 用来存储不同情况下船的信息
// function setShipInfo(state = "", action) {
//     switch (action.type) {
//         case 'SET_WATER_DEPTH_FILENAME':
//             return action.data;
//         default:
//             return state;
//     }
// }
// 设置页面左上角易懂水深文件名
function setWaterDepthFileName(state = "", action) {
    switch (action.type) {
        case 'SET_WATER_DEPTH_FILENAME':
            return action.data;
        default:
            return state;
    }
}
// 获取后台真实水深文件名
function setWaterDepthRealFileName(state = "", action) {
    switch (action.type) {
        case 'SET_WATER_DEPTH_REAL_FILENAME':
            return action.data;
        default:
            return state;
    }
}
// 获取后台真实水深文件名
function loadingWord(state = "", action) {
    switch (action.type) {
        case 'SET_LOADINGWORD':
            return action.data;
        default:
            return state;
    }
}
// 地质文件列表文件名
function setSolumFileName(state = "", action) {
    switch (action.type) {
        case 'SET_SOLUM_FILENAME':
            return action.data;
        default:
            return state;
    }
}
//加载图片
function setLoading(state = false, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return action.data;
        default:
            return state;
    }
}
//加载当前水深文件名
function currentFileName(state = "", action) {
    switch (action.type) {
        case 'SET_FILENAME':
            return action.data;
        default:
            return state;
    }
}
//加载当前水深文件名
function monitorType(state = 1, action) {
    switch (action.type) {
        case 'SET_MONITOR_TYPE':
            return action.data;
        default:
            return state;
    }
}

let rotateDirectionData = {
    leftHorizontal: 0,
    leftVertical: 0,
    rightHorizontal: 0,
    rightVertical: 0
}
function rotateDirection(state = rotateDirectionData, action){
    switch (action.type) {
        case 'SET_ROTATE_DIRECTION':
            return action.data;
        default:
            return state;
    }
}


// 传感器设备管理
let sensorEquipment = {
    shoupen: true,
    shouchui: true,
    chongcang: true,
    yiliu: true,
};
function setSensorEquipmentManagement(state = sensorEquipment, action) {
    switch (action.type) {
        case 'SET_SENSOR_EQUIPMENT':
            sensorEquipment = {
                ...action.data
            };
            return sensorEquipment;
        case 'SET_SENSOR_EQUIPMENT_BY_KEY':
            sensorEquipment[action.key] = action.boolean;
            return {
                ...sensorEquipment
            };
        default:
            return state;
    }
}

// 设置效果参数
let effectParams = {
    diaosheng: 1,
    paonisudu: 1,
    shoupensudu: 1,
    chongcangsudu: 1
}
function setEffectParameters(state = effectParams, action) {
    switch (action.type) {
        case 'SET_EFFECT_PARAMETERS':
            effectParams = {
                ...action.data
            };
            return effectParams;
        case 'SET_EFFECT_PARAMETERS_BY_KEY':
            effectParams[action.key] = Number(action.value.toFixed(1));
            return {
                ...effectParams
            };
        default:
            return state;
    }
}
// 设置场景页面的控制信息（船体透明，移动观察/静止观察/围绕船体，舱内视角/舱外视角
let initScenePageCtrlInfo = {
    isTransparent: false,
    showWater: true,
    observeStatus: 1,
    // perspective: 2  // inside, outside
}
function scenePageCtrlInfo(state = initScenePageCtrlInfo, action){
    if (action.type === 'SET_SCENE_PAGE_CTRL_INFO') {
        return action.data;
    } else {
        return state;
    }
}
//系统参数
function chooseSystem(state = "运动参数", action) {
    switch (action.type) {
        case 'CHOOSE_SYSTEM':
            return action.data;
        default:
            return state;
    }
}
//系统参数
function isClose(state = 0, action) {
    switch (action.type) {
        case 'IS_CLOSE':
            return action.data;
        default:
            return state;
    }
}
// 设置效果参数
let dragLengths = {
    leftUpLength: 21.42488,
    rightUpLength: 21.42488,
    leftDownLength: 11.78558,
    rightDownLength: 11.78558,
}
function dragLength(state = dragLengths,action ){
    switch (action.type) {
        case 'DRAGLENGTH':
            return action.data;
        default:
            return state;
    }
}
function isRun(state = false,action ){
    switch (action.type) {
        case 'ISRUN':
            return action.data;
        default:
            return state;
    }
}
function freeChange(state = 1,action ){
    switch (action.type) {
        case 'FREECHANGE':
            return action.data;
        default:
            return state;
    }
}
// 自由模拟参数
let freeDatas = [
    { id: 1, leftDragUpAngle: 0, reName: 'leftDragUpAngle', val: '左耙上耙垂直角度', attrName: 'leftDragUpAngle,rightDragUpAngle', unit: '度' },
    { id: 2, link: true, reName: 'up' },
    { id: 3, rightDragUpAngle: 0, reName: 'rightDragUpAngle', val: '右耙上耙垂直角度', attrName: 'rightDragUpAngle,leftDragUpAngle', unit: '度' },
    { id: 4, leftDragUpHorAngle: 0, reName: 'leftDragUpHorAngle', val: '左耙上耙水平角度', attrName: 'leftDragUpHorAngle,rightDragUpHorAngle', unit: '度' },
    { id: 5, link: true, reName: 'upHor' },
    { id: 6, rightDragUpHorAngle: 0, reName: 'rightDragUpHorAngle', val: '右耙上耙水平角度', attrName: 'rightDragUpHorAngle,leftDragUpHorAngle', unit: '度' },
    { id: 7, leftDragDownAngle: 0, reName: 'leftDragDownAngle', val: '左耙下耙垂直角度', attrName: 'leftDragDownAngle,rightDragDownAngle', unit: '度' },
    { id: 8, link: true, reName: 'down' },
    { id: 9, rightDragDownAngle: 0, reName: 'rightDragDownAngle', val: '右耙下耙垂直角度', attrName: 'rightDragDownAngle,leftDragDownAngle', unit: '度' },
    { id: 10, leftDragDownHorAngle: 0, reName: 'leftDragDownHorAngle', val: '左耙下耙水平角度', attrName: 'leftDragDownHorAngle,rightDragDownHorAngle', unit: '度' },
    { id: 11, link: true, reName: 'downHor' },
    { id: 12, rightDragDownHorAngle: 0, reName: 'rightDragDownHorAngle', val: '右耙下耙水平角度', attrName: 'rightDragDownHorAngle,leftDragDownHorAngle', unit: '度' },
    { id: 13, leftRunAngle: 0, reName: 'leftRunAngle', val: '左耙耙头活动罩角度', attrName: 'leftRunAngle', unit: '度' },
    { id: 14, link: true, reName: 'downhead' },
    { id: 15, rightRunAngle: 0, reName: 'rightRunAngle', val: '右耙耙头活动罩角度', attrName: 'rightRunAngle', unit: '度' }
];
function freeData(state = freeDatas,action ) {
    switch (action.type) {
        case 'FREEDATA':
            return action.data;
        default:
            return state;
    }
}
// 耙头定深参数
let depthDatas = [
    { id: 1, downGoodAngle: 0, reName: 'downGoodAngle', val: '采用最佳角度', attrName: 'downGoodAngle', unit: '', hasCheck: true },
    { id: 2, leftDragDepth: 0, reName: 'leftDragDepth', val: '左耙挖深', attrName: 'leftDragDepth,rightDragDepth', unit: 'm', hasCheck: false },
    { id: 3, link: true, reName: 'depth' },
    { id: 4, rightDragDepth: 0, reName: 'rightDragDepth', val: '右耙挖深', attrName: 'rightDragDepth,leftDragDepth', unit: 'm', hasCheck: false, },
    { id: 5, leftDragUpAngle: 0, reName: 'leftDragUpAngle', val: '左耙上耙垂直角度', attrName: 'leftDragUpAngle,rightDragUpAngle', unit: '度', hasCheck: false },
    { id: 6, link: true, reName: 'up', type: 'angle' },
    { id: 7, rightDragUpAngle: 0, reName: 'rightDragUpAngle', val: '右耙上耙垂直角度', attrName: 'leftDragUpAngle,rightDragUpAngle', unit: '度', hasCheck: false },
    { id: 8, leftDragUpHorAngle: 0, reName: 'leftDragUpHorAngle', val: '左耙上耙水平角度', attrName: 'leftDragUpHorAngle,rightDragUpHorAngle', unit: '度', hasCheck: false },
    { id: 9, link: true, reName: 'upHor', type: 'angle' },
    { id: 10, rightDragUpHorAngle: 0, reName: 'rightDragUpHorAngle', val: '右耙上耙水平角度', attrName: 'rightDragUpHorAngle,leftDragUpHorAngle', unit: '度', hasCheck: false },

    { id: 11, leftDragDownAngle: 0, reName: 'leftDragDownAngle', val: '左耙下耙垂直角度', attrName: 'leftDragDownAngle,rightDragDownAngle', unit: '度', hasCheck: false },
    { id: 12, link: true, reName: 'down', type: 'angle' },
    { id: 13, rightDragDownAngle: 0, reName: 'rightDragDownAngle', val: '右耙下耙垂直角度', attrName: 'leftDragDownAngle,rightDragDownAngle', unit: '度', hasCheck: false },

    { id: 14, leftDragDownHorAngle: 0, reName: 'leftDragDownHorAngle', val: '左耙下耙水平角度', attrName: 'leftDragDownHorAngle,rightDragDownHorAngle', unit: '度', hasCheck: false },
    { id: 15, link: true, reName: 'downHor', type: 'angle' },
    { id: 16, rightDragDownHorAngle: 0, reName: 'rightDragDownHorAngle', val: '右耙下耙水平角度', attrName: 'leftDragDownHorAngle,rightDragDownHorAngle', unit: '度', hasCheck: false },
    { id: 17, leftRunAngle: 0, reName: 'leftRunAngle', val: '左耙耙头活动罩角度', attrName: 'leftRunAngle,rightRunAngle', unit: '度', hasCheck: false },
    { id: 18, link: true, reName: 'downhead' },
    { id: 19, rightRunAngle: 0, reName: 'rightRunAngle', val: '右耙耙头活动罩角度', attrName: 'rightRunAngle,leftRunAngle', unit: '度', hasCheck: false }
  ];
function depthData(state = depthDatas,action ) {
    switch (action.type) {
        case 'DEPTHDATA':
            return action.data;
        default:
            return state;
    }
}
/**
 * 自由模拟还是实时模拟
 * @param {*} state user用户控制 system 系统控制
 * @param {*} action
 */
function controlType(state = 'user',action ){
    switch (action.type) {
        case 'CONTROLTYPE':
            return action.data;
        default:
            return state;
    }
}

function viewType(state = 1,action ) {
    switch (action.type) {
        case 'VIEWTYPE':
            return action.data;
        default:
            return state;
    }
}
function isViewClose(state = true,action ) {
    switch (action.type) {
        case 'ISVIEWTYPE':
            return action.data;
        default:
            return state;
    }
}
export default combineReducers({
    scenePageInfo: setScenePageInfo, // 设置场景页面的信息
    waterDepthFileName: setWaterDepthFileName, // 设置页面左上角水深文件名
    sensorEquipmentManagement: setSensorEquipmentManagement, // 设置传感器管理设备
    effectParameters:setEffectParameters, // 设置效果参数
    WaterDepthRealFileName:setWaterDepthRealFileName,
    solumFileName: setSolumFileName,
    isLoading:setLoading,
    currentFileName:currentFileName,
    loadingWord:loadingWord,
    monitorType:monitorType,    //自由模拟还是耙头定深
    chooseSystem:chooseSystem,  //运动参数还是系统参数
    isClose:isClose,    //右边窗口是否关闭
    dragLength:dragLength,  //系统参数耙臂长度
    isRun:isRun,
    freeChange:freeChange, //自由模拟技术过程弹框控制
    freeData:freeData,
    depthData:depthData,
    controlType:controlType,//自由模拟还是实时模拟
    viewType:viewType,
    scenePageCtrlInfo:scenePageCtrlInfo,
    isViewClose: isViewClose,
    rotateDirection:rotateDirection,
})
