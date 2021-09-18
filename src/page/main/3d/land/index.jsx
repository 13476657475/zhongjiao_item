import * as THREE from '../jsm/three.module.js';

import { requestLand } from '../../../../api/server';

import store from '../../../../redux/store';

import { worker } from './worker.js';

import { depthColorData } from '../../requestParent.jsx';
import { SubdivisionModifier } from '../jsm/modifiers/SubdivisionModifier.js';

import { updateWaterPerspective, scene } from '../scene'

let TOOLACTION = false; // 工具执行中？
let landGroup; // 地质组
let landMaterial; // 地质材质
let loadLandSucceed = true; // 加载地质完成
let landGeometry; // 泥层对象的几何体
let atSquareIndex; // 在区域内的索引
let positionlist; // 位置列表
let solidColor = [];
let solidName = [];
let shipPosition = {};//初始船的位置
let currentFileSize = [];
// let shipbox = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));

// 地质材质
function landMaterialFunc() {
    console.log("水深文件颜色", depthColorData)
    if (landMaterial || depthColorData.length===0) return landMaterial;
    //遍历获得将要定一个多大的二维数组
    var clor='vec3  clmm['+depthColorData.length+'];\n';
    let depth = 'float small['+depthColorData.length+'];\n';
    //将二维数组mm赋值
    for (let j = 0; j < depthColorData.length; j++) {
        //土层mindepth****
        let colorStr = '';
        
        //土层mindepth****
        for (let i = 0; i < depthColorData[j].color.length; i++) {
            //土层颜色****
            colorStr = 'vec3('+depthColorData[j].color[0].toFixed(5)+', '+depthColorData[j].color[1].toFixed(5)+', '+depthColorData[j].color[2].toFixed(5)+')';
        }
        depth =depth +'small['+j+']='+depthColorData[j].small.toFixed(2)+';\n';
        clor=clor+'clmm['+j+']='+colorStr+';\n';
    }
    const HeightColor = ['#define PHONG', 'varying vec3 HeightColor;'].join('\n');
    const  judgmentClamp =clor+depth+`
    float sz[2];
    sz[0]=90000.0;
    sz[1]=5.0;
    //遍历深度
    for(int ji=0;ji<${depthColorData.length};ji++){
        if (position.y > -small[ji]) {
            if(ji==1){
                HeightColor = clmm[ji];
            }else{
                HeightColor = mix(clmm[ji],clmm[ji-1], clamp(position.y + small[ji], 0., 1.));
                }
            break;
        }
    }
      `;
    //   console.log( judgmentClamp )
    landMaterial = new THREE.MeshPhongMaterial({ color: 0x666666, side: THREE.DoubleSide });
    landMaterial.onBeforeCompile = function (shader) {
        // 替换顶点着色器
        shader.vertexShader = shader.vertexShader.replace(
            '#define PHONG',
            HeightColor
        ).replace(
            'vViewPosition = - mvPosition.xyz;',
            [
                'vViewPosition = - mvPosition.xyz;',
                judgmentClamp,
            ].join('\n')
        );
        shader.fragmentShader = shader.fragmentShader.replace(
            '#define PHONG',
            HeightColor
        ).replace(
            'vec4 diffuseColor = vec4( diffuse, opacity );',
            'vec4 diffuseColor = vec4( diffuse * HeightColor, opacity );'
        );        
    };
    return landMaterial;
}

// 初始化陆地对象函数
function initLand() {
    landGroup = new THREE.Group();
    landGroup.name = '地质组';
    TOOLACTION = true;
    return landGroup;
}
// worker监听完成计算的回调
function workerOnMessage(data) {
    switch (data.cmd) {
        // 初始化土地
        case 'InitLand':
            createLands(data.params.data);
            loadLandSucceed = true;
            break;
        case 'solumLand':
            createSolumLand(data.params.data)
            break;
        // 更新土地
        case 'UpdateLand':
            batchUpdateOfLands(data.params.data);
            break;
        // 更新土地顶点
        case 'UpdateLandByVec':
            batchUpdateOfLands2(data.params.data,data.params.rowCol);
            break;
        // 疏浚工作
        case 'Dredging':
            updateLandGeometry(data.params);
            break;
        default:
            break;
    };
}

// 请求土地数据
function requestLandData(params) {
    requestLand(params).then(function (res) {
        console.log('请求土地的结果：', res);

        worker.postMessage({
            cmd: 'UpdateLand',
            params: res.data,
        });
    }).catch(err => {
        console.log(err)
    })
}

function subdivideGeometry(vertices) {
    // SubdivisionModifier
    let bufferGeometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(vertices, 6));

    let geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);
    geometry.mergeVertices();

    let smoothGeometry = new SubdivisionModifier(1).modify(geometry);

    return new THREE.BufferGeometry().fromGeometry(smoothGeometry)
}

// 创建土地数据
function createLands(params) {
    landMaterial = null;
    let mtl = landMaterialFunc();//着色器
    for (let i = 0, len = params.length; i < len; i++) {
        let { mode, XYZs } = params[i];
        let geo;
        // if (mode === "detail") {
        //     geo = subdivideGeometry(XYZs);

        //     worker.postMessage({
        //         cmd: 'UpdateXYZ',
        //         params: {
        //             'row-col': params[i]['row-col'],
        //             XYZs: geo.attributes.position.array
        //         },
        //     });
        //     // geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(XYZs, 3));
        // } else {
            geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(XYZs, 3));
        // }
        geo.computeVertexNormals(); // 计算法线
        let landMesh = new THREE.Mesh(geo, mtl);
        landMesh.name = '河床表面' + params[i]['row-col'];        
        landGroup.add(landMesh);
        setLoading(false)
    }
}
// 水深文件土地加载
function createSolumLand(data) {
    landMaterial = null;
    let mtl = landMaterialFunc();//着色器
    let geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(data, 3));
    geo.computeVertexNormals(); // 计算法线
    let landMesh = new THREE.Mesh(geo, mtl);
    landMesh.name = '地质组';
    landGroup.add(landMesh);
    setLoading(false);
    for (let i = 0, len = landGroup.children.length; i < len; i++) {
        landMesh.add(landGroup.children[i].clone());
    }
}

function batchUpdateOfLands(datas) {
    // console.log(datas);
    for (const data of datas) {
        let tempLandMesh = landGroup.getObjectByName('河床表面' + data['row-col']);
        tempLandMesh.geometry.dispose();
        tempLandMesh.geometry = subdivideGeometry(data.XYZs);
        tempLandMesh.geometry.computeVertexNormals(); // 计算法线
        worker.postMessage({
            cmd: 'UpdateXYZ',
            params: {
                'row-col': data['row-col'],
                XYZs: tempLandMesh.geometry.attributes.position.array
            },
        });
    }
}
function batchUpdateOfLands2(rake,data) {
//     console.log("耙头坐标",rake)
//     console.log("降点网格",data)
    //rake.position.z=28;  //钱鑫调试用
    // console.log(landGroup)
    //钱鑫新增   直接对scene进行降顶点                
    // console.log("场景",scene);
    let groud_mesh2 = scene.getObjectByName('地质组');
    let groud_mesh = groud_mesh2.getObjectByName('河床表面' + data);    
    let groud_geometry = groud_mesh.geometry;
    let groud_g_array = groud_geometry.attributes.position.array;
    let start=-1;
    let count=0;
    for (let i = 0; i < groud_g_array.length; i += 3) {
        var delta0X = rake.position.x - groud_g_array[i];
        var delta0Z = rake.position.y - groud_g_array[i + 2];
        if (delta0X * delta0X + delta0Z * delta0Z <= 4) {
            // console.log("水平距离小于2m");            
           if (-1*rake.position.z < groud_g_array[i + 1]) 
           {
                // console.log("垂直方向耙土已确定");
                groud_g_array[i + 1] = -1*rake.position.z;
                // groud_g_array[i + 1] = -20;  //这里写死-20是为了模拟耙比较深，上传甲方时注释，并将上面两个注释打开
                if (start===-1){
                    start = i;                    
                }else{
                    if(start>i) start=i;
                    if(i-start>count) count = i - start;
                }                    
            }
        }
    }
    // console.log("顶点更新开始号：",start);
    // console.log("更新数量：",count);
    if(start!==-1){
    groud_geometry.attributes.position.needsUpdate = true;
    groud_geometry.attributes.position.updateRange.offset = start;
    groud_geometry.attributes.position.updateRange.count = count + 3;
    groud_geometry.computeVertexNormals(); // 计算法线
    }
    //console.log("修改后的场景",scene);
    
}


// function batchUpdateOfLands2(datas) {
//     console.log("降点更新",datas)
//     for (const data of datas) {
//         let tempLandMesh = landGroup.getObjectByName('河床表面' + data['row-col']);
//         tempLandMesh.geometry.attributes.position.copyArray(data.XYZs);
//         tempLandMesh.geometry.attributes.position.needsUpdate = true;
//         tempLandMesh.geometry.computeVertexNormals(); // 计算法线
//     }
// }

function updateLandGeometry(vertices, remove) {
    if (remove) {
        landGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    } else {
        landGeometry.attributes.position.copyArray(vertices);
        landGeometry.attributes.position.needsUpdate = true;
    }
    landGeometry.computeVertexNormals(); // 计算法线
    if (remove) console.log(landGeometry);
}
// 初始加载调用两个接口
function updateLandByUpFile(xyzFilesname, uidName, gpsInfo){
    if(xyzFilesname[0] !== []){
        let waterDepthList ="["; //首次从后台拿列表中附件的水深文件名
        let waterDepthList1 = []; //窗口左上角下拉列表
        let waterRealDepthList = [];//真实uid水深文件名称        
        for (let i = 0; i < uidName.length; i++) {
            waterDepthList = waterDepthList+ uidName[i]
            if(i<xyzFilesname.length-1){
                waterDepthList = waterDepthList+','
            }
            waterRealDepthList.push( {name:xyzFilesname[i],real_name:uidName[i]})
        }
        waterDepthList = waterDepthList+ "]";
        setWaterDepthRealFileName(waterRealDepthList);//redux存放真实后台水深文件名    
        if(waterDepthList !== ""){
            xguid = GUID();
            requestLand({
                method: 'GetCurrentSSid',
                start_time: Math.floor(new Date() / 1000),
                water_depth_file_name: waterDepthList,
                gpsX: gpsInfo.x, gpsY: gpsInfo.y,
                guid: xguid,
            }).then(function (res1) {
                if(res1.data === ""){
                    console.log("找不到最近水深文件")
                }
                for (let i = 0; i < uidName.length; i++) {
                    if(uidName[i] === res1.data){
                        store.dispatch({
                            type: 'SET_FILENAME',
                            data: xyzFilesname[i],
                        });
                        waterDepthList1.push({name:xyzFilesname[i],isSelect:true});
                    }else{
                        waterDepthList1.push({name:xyzFilesname[i],isSelect:false});
                    }
                }
                setWaterDepthFileName(waterDepthList1); //redux窗口左上角下拉列表
                requestLand({
                    method: 'land_init',
                    start_time: Math.floor(new Date() / 1000),
                    water_depth_file_name: res1.data,
                    gpsX: gpsInfo.x, gpsY: gpsInfo.y,
                    guid: xguid,
                }).then(function (res) {
                    console.log('请求土地的结果：', res);
                    store.dispatch({
                        type: 'SET_LOADING',
                        data: true,
                    });
                    store.dispatch({
                        type: 'SET_LOADINGWORD',
                        data: "水深加载中",
                    });
                    shipPosition.x = (res.data.positionlist[res.data.positionlist.length-1].maxx+res.data.positionlist[0].minx)/2;
                    shipPosition.y = (res.data.positionlist[res.data.positionlist.length-1].maxy+res.data.positionlist[0].miny)/2;
                    updateWaterPerspective(shipPosition)
                    currentFileSize.maxx = res.data.positionlist[res.data.positionlist.length-1].maxx;
                    currentFileSize.maxy = res.data.positionlist[res.data.positionlist.length-1].maxy;
                    currentFileSize.minx = res.data.positionlist[0].minx;
                    currentFileSize.miny = res.data.positionlist[0].miny;
                    // 如果没有位置列表，则赋值位置列表
                    if (!positionlist) positionlist = res.data.positionlist;
                    // 确定所在区域的索引
                    for (let i = 0, len = res.data.waterDepth.length; i < len; i++) {
                        if (res.data.waterDepth[i].atSquare) {
                            atSquareIndex = i;
                            break;
                        }
                    }                
                    worker.postMessage({
                        cmd: 'Land',
                        params: res.data,
                    });
                });
            })
        }
    }
    
}
// 初始加载调用两个接口
function solumFileSelect(solumFilesname, uidName ){
    let solumDataList = []; //窗口左上角下拉列表
    for (let i = 0; i < uidName.length; i++) {
        solumDataList.push( {name:solumFilesname[i],real_name:uidName[i]})
    }
    setSolumFileName(solumDataList);//redux存放真实后台水深文件名
}
// 更新水深文件名
function setWaterDepthFileName(name) {
    store.dispatch({
        type: 'SET_WATER_DEPTH_FILENAME',
        data: name,
    });
}
// 更新水深文件名
function setWaterDepthRealFileName(name) {
    store.dispatch({
        type: 'SET_WATER_DEPTH_REAL_FILENAME',
        data: name,
    });
}
// 更新地质文件名
function setSolumFileName(name) {
    store.dispatch({
        type: 'SET_SOLUM_FILENAME',
        data: name,
    });
}
function setLoading(name) {
    store.dispatch({
        type: 'SET_LOADING',
        data: name,
    });
}
/**
 * 设置GPS 
 * 没有地质的时候，请求地质信息 
 * 有地质信息的时候，去判断是否超出边界，如果超出了边界，则要进行更新地质详细数据信息请求
 * @param {*} params 
 */
let xguid;
function setGPS({ x, y }) {
    // x = 30;
    // y = 300;
    if (!TOOLACTION) return;

    if (loadLandSucceed) {

        // 判断是否在范围内
        let isAtSquare = false; // 是否在区域内
        for (let i = 0, len = positionlist.length; i < len; i++) {
            let { minx, miny, maxx, maxy } = positionlist[i];
            if (x > minx && y > miny && x < maxx && y < maxy) {
                isAtSquare = true;
                // 如果所在区域的索引不是当前索引。则更新土地
                if (atSquareIndex !== i) {
                    atSquareIndex = i;
                    requestLandData({
                        method: 'GetLandData',
                        water_depth_file_name: store.getState().waterDepthFileName,
                        gpsX: x, gpsY: y,
                        guid: xguid,
                    })
                }
                break;
            }
        }
        if (!isAtSquare) {
            store.dispatch({
                type: 'SET_FILENAME',
                data: "",
            });
            atSquareIndex = false; // 如果不在区域内，则在范围索引内设置为false
        }
    } else {
        // let WaterDepthRealFileNames =  store.getState();
        // if(WaterDepthRealFileNames.WaterDepthRealFileName.length!=0){
        //     let waterDepthList ="["; //首次从后台拿列表中附件的水深文件名=
        
        // for (let i = 0; i < WaterDepthRealFileNames.WaterDepthRealFileName.length; i++) {
        //     waterDepthList = waterDepthList+ WaterDepthRealFileNames.WaterDepthRealFileName[i].real_name
        //     if(i<WaterDepthRealFileNames.WaterDepthRealFileName.length-1){
        //         waterDepthList = waterDepthList+','
        //     }
        // }
        // waterDepthList = waterDepthList+ "]";
        //     if (!initReuquestLand) {
        //         xguid = GUID();
        //         requestLand({
        //             method: 'GetCurrentSSid',
        //             start_time: Math.floor(new Date() / 1000),
        //             water_depth_file_name: waterDepthList,
        //             gpsX: x, gpsY: y,
        //             guid: xguid,
        //         }).then(function (res) {
        //             console.log("setGPSData",res.data);
        //             console.log("currentFileName",currentFileName)
        //             if(currentFileName !="" && res.data != currentFileName){
        //                 requestLand({
        //                     method: 'land_init',
        //                     start_time: Math.floor(new Date() / 1000),
        //                     water_depth_file_name: res.data,
        //                     gpsX: x, gpsY: y,
        //                     guid: xguid,
        //                 }).then(function (res) {
        //                     console.log('setGPSData请求土地的结果：', res);    
        //                     // 如果没有位置列表，则赋值位置列表
        //                     if (!positionlist) positionlist = res.data.positionlist;    
        //                     // 确定所在区域的索引
        //                     for (let i = 0, len = res.data.waterDepth.length; i < len; i++) {
        //                         if (res.data.waterDepth[i].atSquare) {
        //                             atSquareIndex = i;
        //                             break;
        //                         }
        //                     }                    
        //                     worker.postMessage({
        //                         cmd: 'Land',
        //                         params: res.data,
        //                     });
        //                 });
        //             }
        //         })  
        //     }
        //     initReuquestLand = true;
        // }
        
    }
}

/**
 *  疏浚过程
 * @param {*} rake1 左耙数据
 * @param {*} rake2 右耙数据
 */
//耙土相关
function dredgingByLand(rake1, rake2) {
    if (!TOOLACTION) return;    
    if (loadLandSucceed) {
        //computecomplete=false;
        if (rake1.raking) {
            worker.postMessage({
                cmd: 'Dredging',
                params: {
                    rake: rake1,
                },
            });
        }
        if (rake2.raking) {
            worker.postMessage({
                cmd: 'Dredging',
                params: {
                    rake: rake2,
                },
            });
        }
    }
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

export {
    GUID,
    landGroup, //地的组
    initLand, // 初始化陆地组件函数 供外部调用初始化
    setGPS,// 设置GPS参数 
    dredgingByLand, // 疏浚操作
    updateLandByUpFile, //更新土地
    solumFileSelect, //切换地质文件
    landMaterialFunc, // 陆地材质

    workerOnMessage, // 请求完整陆地

    solidColor,//地质文件每一层颜色

    solidName, //地质每一层土质

    currentFileSize, //当前水深文件大小

    positionlist,
     
    subdivideGeometry,

    shipPosition //初始船的中心点
};

