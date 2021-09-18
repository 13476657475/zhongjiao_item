importScripts('../libs/delaunator.js');

let VC; // 顶点容器
let DVC; // 完整顶点容器

let waterDepth; // 水深数据

let handleWaterDepth; // 处理后的水深文件

this.addEventListener('message', function (e) {
    let data = e.data;
    switch (data.cmd) {
        case 'start':
            this.postMessage('WORKER STARTED: ' + data.msg);
            break;
        case 'stop':
            this.postMessage('WORKER STOPPED: ' + data.msg);
            this.close(); // Terminates the worker.
            break;

        // 土地
        case 'Land':
            // landHandle(data.params);
            // landHandle2(data.params);
            landHandle3(data.params);
            break;
        case 'visualLand':
            // landHandle(data.params);
            // landHandle2(data.params);
            landHandle4(data.params);
            break;
        case 'solumLand':
            // landHandle(data.params);
            // landHandle2(data.params);
            solumHandle(data.params);
            break;
        // 更新土地
        case 'UpdateLand':
            // landHandle(data.params);
            // landHandle2(data.params);
            updateLandHandle(data.params);
            break;

            CalPlaneLineIntersectPoint

        // 更新土地顶点
        case 'UpdateXYZ':
            UpdateXYZ(data.params);
            break;


        // 疏浚工作,耙土相关
        case 'Dredging':
            // vertexDecline(data.params.rake);
            vertexDecline2(data.params.rake);
            break;


        // 全部土地
        // case 'DetailLand':
        //     // detailLandHandle(data.params);
        //     detailLandHandle2(data.params);
        //     break;

        // 计算裁剪面
        case 'CuttingSurface':
            lineIntersection(data.params.v1, data.params.v2);
            break;

        default:
            break;
    };
}, false);

// 判断点在圆内
function insideCircle(p, c, r) {
    let dx = c.x - p.x, dy = c.y - p.y;
    return dx * dx + dy * dy <= r * r;
}

// 判断点在多边形内
function insidePolygon(p, ps) {
    let x = p.x, y = p.y;
    let inside = false;
    for (let i = 0, j = ps.length - 1; i < ps.length; j = i++) {
        let xi = ps[i].x, yi = ps[i].y;
        let xj = ps[j].x, yj = ps[j].y;

        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

function zoom(ps, offset) {

    let array = [];

    for (let i = 0, len = ps.length; i < len; i++) {
        let curP = ps[i];

        let lastP = (i == 0) ? ps[len - 1] : ps[i - 1],
            nextP = (i == len - 1) ? ps[0] : ps[i + 1];

        let vec1 = { x: lastP.x - curP.x, y: lastP.y - curP.y },
            vec2 = { x: nextP.x - curP.x, y: nextP.y - curP.y };

        console.log(vec1, vec2);

        let scalar1 = 1 / (Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y) || 1),
            scalar2 = 1 / (Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y) || 1);

        vec1.x *= scalar1;
        vec1.y *= scalar1;
        vec2.x *= scalar2;
        vec2.y *= scalar2;

        let normVec = { x: vec1.x + vec2.x, y: vec1.y + vec2.y };

        let scalar = 1 / (Math.sqrt(normVec.x * normVec.x + normVec.y * normVec.y) || 1) * offset;

        normVec.x *= scalar;
        normVec.y *= scalar;

        array.push({ X: curP.x + normVec.x, Y: curP.y + normVec.y, Z: 14.335 });

    }

    return array;

}

// Delaunator化过程
function delaunatorProcess(params) {

    // 提取顶点信息
    let array = [], position = [];
    for (let i = 0, len = params.length; i < len; i++) {
        array.push([params[i].X, params[i].Y]);
    }

    // 格式化且计算三角面索引
    let triangles = Delaunator.from(array).triangles;

    for (let i = 0, len = triangles.length; i < len; i += 3) {
        position.push(
            params[triangles[i]].X, - params[triangles[i]].Z, params[triangles[i]].Y,
            params[triangles[i + 1]].X, - params[triangles[i + 1]].Z, params[triangles[i + 1]].Y,
            params[triangles[i + 2]].X, - params[triangles[i + 2]].Z, params[triangles[i + 2]].Y);
    }

    // VC = position;

    return new Float32Array(position);
}

// 地质数据处理
function landHandle(params) {

    let currArea, arr1 = [], arr2 = [], arr3 = [];

    for (let i = 0, len = params.length; i < len; i++) {

        let { XYZs, mode, atSquare } = thisParam = params[i];

        if (atSquare) currArea = [thisParam.minx, thisParam.miny, thisParam.maxx, thisParam.maxy];

        if (XYZs.length > 0) {
            for (let j = 0, jlen = XYZs.length; j < jlen; j++) {

                // XYZs[j].Y = - XYZs[j].Y;
                // const { X, Y } = XYZs[j];
                // arr1.push(XYZs[j]);
                // arr2.push([X, Y]);

                if (mode === 'detail' && j % 3 === 0) {
                    XYZs[j].Y = - XYZs[j].Y;
                    const { X, Y } = XYZs[j];
                    arr1.push(XYZs[j]);
                    arr2.push([X, Y]);
                } else if (mode === 'simple') {
                    XYZs[j].Y = - XYZs[j].Y;
                    const { X, Y } = XYZs[j];
                    arr1.push(XYZs[j]);
                    arr2.push([X, Y]);
                }
            }
        }
    }

    // 格式化且计算三角面索引
    let triangles = Delaunator.from(arr2).triangles;

    for (let i = 0, len = triangles.length; i < len; i += 3) {
        arr3.push(
            arr1[triangles[i]].X, - arr1[triangles[i]].Z, arr1[triangles[i]].Y,
            arr1[triangles[i + 1]].X, - arr1[triangles[i + 1]].Z, arr1[triangles[i + 1]].Y,
            arr1[triangles[i + 2]].X, - arr1[triangles[i + 2]].Z, arr1[triangles[i + 2]].Y);
    }

    VC = arr3;

    this.postMessage({
        cmd: 'Land',
        params: {
            currArea,
            vertices: new Float32Array(arr3),
        }
    });

}

// 地质数据处理
function landHandle2(params) {

    let currArea, arr1 = [], arr2 = [], arr3 = [];

    for (let i = 0, len = params.length; i < len; i++) {

        let { XYZs, mode } = thisParam = params[i];

        if (XYZs.length > 0) {
            for (let j = 0, jlen = XYZs.length; j < jlen; j++) {

                XYZs[j].Y = - XYZs[j].Y;
            }
            arr3.push(delaunatorProcess(XYZs));
        }
    }

    this.postMessage({
        cmd: 'Land',
        params: {
            currArea,
            // vertices: new Float32Array(arr3),
            vertices: arr3,
        }
    });

}

// 地质数据处理
function landHandle3(params) {
    handleWaterDepth = [];
    waterDepth = params.waterDepth;
    for (let i = 0, len = waterDepth.length; i < len; i++) {
        let { XYZs } = waterDepth[i]; // 解构赋值 获取水深文件的xyzs信息
        if (XYZs.length > 0) {
            for (let j = 0, jlen = XYZs.length; j < jlen; j++) {
                XYZs[j].Y = - XYZs[j].Y;
            }
            waterDepth[i].XYZs = delaunatorProcess(XYZs); //变网格顶点变为三角面
            if (waterDepth[i].XYZs.length > 0) {
                handleWaterDepth.push({
                    'row-col': waterDepth[i].row + '-' + waterDepth[i].col,
                    mode: waterDepth[i].mode,
                    XYZs: waterDepth[i].XYZs,
                    minx: waterDepth[i].minx,
                    miny: waterDepth[i].miny,
                    maxx: waterDepth[i].maxx,
                    maxy: waterDepth[i].maxy,
                })
            }

        }

    }

    this.postMessage({
        cmd: 'InitLand',
        params: {
            data: handleWaterDepth,
        }
    });
}
function landHandle4(params) {
    console.log(params)
    // console.log(params);
    handleWaterDepth = [];

    waterDepth = params.waterDepth;
    for (let i = 0, len = waterDepth.length; i < len; i++) {

        let { XYZs } = waterDepth[i]; // 解构赋值 获取水深文件的xyzs信息

        if (XYZs.length > 0) {
            for (let j = 0, jlen = XYZs.length; j < jlen; j++) {
                XYZs[j].Y = - XYZs[j].Y;
            }
            waterDepth[i].XYZs = delaunatorProcess(XYZs); //变网格顶点变为三角面
            if (waterDepth[i].XYZs.length > 0) {
                handleWaterDepth.push({
                    'row-col': waterDepth[i].row + '-' + waterDepth[i].col,
                    mode: waterDepth[i].mode,
                    XYZs: waterDepth[i].XYZs,
                    minx: waterDepth[i].minx,
                    miny: waterDepth[i].miny,
                    maxx: waterDepth[i].maxx,
                    maxy: waterDepth[i].maxy,
                })
            }

        }

    }
    this.postMessage({
        cmd: 'DetailLand',
        params: {
            data: handleWaterDepth,
        }
    });
}
function solumHandle(data) {
    handleWaterDepth = [];
    waterDepth = data;
    waterDepth = delaunatorProcess(data);
    this.postMessage({
        cmd: 'solumLand',
        params: {
            data: waterDepth,
        }
    });
}

// 更新为密集顶点
function UpdateXYZ(params) {
    for (let i = 0, len = handleWaterDepth.length; i < len; i++) {
        if (params['row-col'] === handleWaterDepth[i]['row-col']) {
            handleWaterDepth[i].XYZs = params.XYZs;
        }
    }
}

// 全部地质数据处理
function detailLandHandle(params) {

    let arr1 = [], arr2 = [], arr3 = [];

    for (let i = 0, len = params.length; i < len; i++) {

        let XYZs = params[i].XYZs;

        if (XYZs.length > 0) {
            for (let j = 0, jlen = XYZs.length; j < jlen; j++) {
                XYZs[j].Y = - XYZs[j].Y;
                const { X, Y } = XYZs[j];
                arr1.push(XYZs[j]);
                arr2.push([X, Y]);
            }
        }
    }

    // 格式化且计算三角面索引
    let triangles = Delaunator.from(arr2).triangles;

    for (let i = 0, len = triangles.length; i < len; i += 3) {
        arr3.push(
            arr1[triangles[i]].X, - arr1[triangles[i]].Z, arr1[triangles[i]].Y,
            arr1[triangles[i + 1]].X, - arr1[triangles[i + 1]].Z, arr1[triangles[i + 1]].Y,
            arr1[triangles[i + 2]].X, - arr1[triangles[i + 2]].Z, arr1[triangles[i + 2]].Y);
    }

    DVC = arr3;

    this.postMessage({
        cmd: 'DetailLand',
        params: new Float32Array(arr3),
    });

}

// 全部地质数据处理
function detailLandHandle2(params) {

    this.postMessage({
        cmd: 'DetailLand',
        // params: new Float32Array(arr3),
        params: {
            data: handleWaterDepth,
        }
    });

}


function updateLandHandle(params) {

    let array = [];

    for (let i = 0, len = handleWaterDepth.length; i < len; i++) {
        if (handleWaterDepth[i].mode === 'detail') continue; // detail跳过

        for (let j = 0, jlen = params.length; j < jlen; j++) {
            let { row, col, XYZs } = params[j];

            if (row + '-' + col === handleWaterDepth[i]['row-col']) {
                handleWaterDepth[i].mode === 'detail';
                for (let k = 0, klen = XYZs.length; k < klen; k++) {
                    XYZs[k].Y = - XYZs[k].Y;
                }
                handleWaterDepth[i].XYZs = delaunatorProcess(XYZs);
                array.push({
                    'row-col': handleWaterDepth[i]['row-col'],
                    XYZs: handleWaterDepth[i].XYZs,
                });
                break;
            }

        }

    }

    this.postMessage({
        cmd: 'UpdateLand',
        params: {
            data: array,
        }
    });
}

/**
 * 顶点下降
 * @param {*} rake 耙得数据
 */
function vertexDecline2(rake) {
    if(!handleWaterDepth) return;
    let array = [];
    const { x, y, z } = rake.position;
    let has1 = false;
    for (let k = 0 ; k < handleWaterDepth.length; k++) {
        if (x - handleWaterDepth[k].minx > -2 || y - handleWaterDepth[k].miny > -2 || handleWaterDepth[k].x - maxx < 2 || handleWaterDepth[k].y - maxy < 2) {
            this.postMessage({
                cmd: 'UpdateLandByVec',
                params: {
                    data: rake,
                    rowCol: handleWaterDepth[k]['row-col']
                }
            });
        }
    }
}

// function vertexDecline(rake) {
//     const { x, y, z } = rake.position;
//     for (let i = 0, len = VC.length; i < len; i += 3) {
//         if (z < VC[i + 1]) {
//             let dx = VC[i] - x, dy = VC[i + 2] - y;
//             if (dx * dx + dy * dy <= 4) VC[i + 1] = z;
//         }
//     }
//     this.postMessage({
//         cmd: 'Dredging',
//         params: new Float32Array(VC),
//     });
// }
// 判断两条直线是否相交
//计算向量叉乘  
var crossMul=function(v1,v2){  
    return   v1.x*v2.y-v1.y*v2.x;  
}  
//判断两条线段是否相交  
var checkCross=function(p1,p2,p3,p4){  
    var v1={x:p1.x-p3.x,y:p1.y-p3.y},  
    v2={x:p2.x-p3.x,y:p2.y-p3.y},  
    v3={x:p4.x-p3.x,y:p4.y-p3.y},  
    v=crossMul(v1,v3)*crossMul(v2,v3)  
    v1={x:p3.x-p1.x,y:p3.y-p1.y}  
    v2={x:p4.x-p1.x,y:p4.y-p1.y}  
    v3={x:p2.x-p1.x,y:p2.y-p1.y}  
    return (v<=0&&crossMul(v1,v3)*crossMul(v2,v3)<=0)?true:false 
}
//判断直线相交
function isLinecrossRectangle(xmin, ymin, xmax, ymax, v1x, v1y, v2x, v2y) {
    let a = {},b = {},c = {},d = {};
    a.x = xmin;
    a.y = ymin;
    b.x = xmin;
    b.y = ymax;
    c.x = xmax;
    c.y = ymin;
    d.x = xmax;
    d.y = ymax;
    
    let vv1 = {},vv2 = {};
    vv1.x = v1x;
    vv1.y = v1y;
    vv2.x = v2x;
    vv2.y = v2y;
    if (checkCross(a, b, vv1, vv2)) return true;
    if (checkCross(c, d, vv1, vv2)) return true;
    if (checkCross(d, b, vv1, vv2)) return true;
    if (checkCross(a,c, vv1, vv2)) return true;
    return false;
}
// 计算两点之间截面数据
function lineIntersection(v1, v2) {
    // 计算线相交划过的三角面顶点
    let scopeArray = [];
    let distArrays1 = [];
    let removalArray = [];
    let rot = 0;
    if (v2.x == v1.x) rot = Math.PI / 2.0;
    else rot = Math.atan2(v2.z - v1.z, v2.x - v1.x); //通过2个点的点位求出夹角弧度值
    var ang = rot;
    rot = rot + Math.PI / 2.0;
    let p1 = {}, p2 = {}, p3 = {}, p4 = {};
    p1.x = v1.x + Math.cos(rot);
    p1.y = v1.z + Math.sin(rot);
    p2.x = v1.x - Math.cos(rot);
    p2.y = v1.z - Math.sin(rot);

    p4.x = v2.x + Math.cos(rot);
    p4.y = v2.z + Math.sin(rot);
    p3.x = v2.x - Math.cos(rot);
    p3.y = v2.z - Math.sin(rot);
    let DVC = [];
    let v1Grid = null, v2Grid = null;

    for (let i = 0, len = handleWaterDepth.length; i < len; i++) {
        if (v1.x < handleWaterDepth[i].maxx && v1.x > handleWaterDepth[i].minx && -v1.z < handleWaterDepth[i].maxy && -v1.z > handleWaterDepth[i].miny) {
            v1Grid = handleWaterDepth[i];
        }
        if (v2.x < handleWaterDepth[i].maxx && v2.x > handleWaterDepth[i].minx && -v2.z < handleWaterDepth[i].maxy && -v2.z > handleWaterDepth[i].miny) {
            v2Grid = handleWaterDepth[i];
        }
    }
    if (v1Grid['row-col'] === v2Grid['row-col']) {
        DVC = DVC.concat([...v2Grid.XYZs]);
    } else {
        for (let i = 0, len = handleWaterDepth.length; i < len; i++) {
            if (handleWaterDepth[i].XYZs.length > 0) {
                if ((handleWaterDepth[i].maxx <= v1Grid.maxx && handleWaterDepth[i].minx >= v2Grid.minx) || (handleWaterDepth[i].maxx <= v2Grid.maxx && handleWaterDepth[i].minx >= v1Grid.minx)) {
                    if (isLinecrossRectangle(handleWaterDepth[i].minx, handleWaterDepth[i].miny, handleWaterDepth[i].maxx, handleWaterDepth[i].maxy, v1.x, -v1.z, v2.x, -v2.z)) {
                        DVC = DVC.concat([...handleWaterDepth[i].XYZs]);
                    }
                }
            }
        }
    }
    for (let i = 0, len = DVC.length; i < len; i += 3) {
        if (
            insidePolygon({
                x: DVC[i], y: DVC[i + 2],
            }, [
                p1, p2, p3, p4
            ])
        ) {
            scopeArray.push(DVC[i], DVC[i + 1], DVC[i + 2]);
        }
    }
    let listAllData = [];
    for (let i = 0, len = scopeArray.length; i < len; i += 3) {
        if (!removalArray.includes(scopeArray[i])) {
            removalArray.push(scopeArray[i]);
            distArrays1.push({
                x: scopeArray[i],
                y: scopeArray[i + 1],
                z: scopeArray[i + 2]
            });
        }
    }
    if (v1.x != v2.x) {

        for (let i = 0; i < distArrays1.length; i++) {
            let c = {};
            let val = {};
            c.x = distArrays1[i].x; c.y = distArrays1[i].z;
            let A = v2.z - v1.z;
            let B = v1.x - v2.x;
            let C = v2.x * v1.z - v1.x * v2.z;
            val = footOfPerpendicular(c.x, c.y, A, B, C);
            if (val) {
                listAllData.push({ x: val.x, y: val.y, z: distArrays1[i].y })
            }
        }
    }
    else {
        for (let i = 0; i < distArrays1.length; i++) {
            listAllData.push({ x: v1.x, y: distArrays1[i].z, z: distArrays1[i].y })
        }
    }
    for (let i = 0; i < listAllData.length; i++) {
        let xxyy = PointRotate(v1.x, v1.z, listAllData[i].x, listAllData[i].y, ang);
        listAllData[i].x = xxyy.x;
        listAllData[i].y = xxyy.y;
    }
    listAllData.sort(sort('x')); // 根据距离排序
    this.postMessage({
        cmd: 'CuttingSurface1',
        params: {
            data: listAllData,
            v1: v1,
            v2: v2,
            ang: ang
        }
    });
    // 清空数组,可以达到释放内存效果
    DVC = null;
    listAllData = null;
    scopeArray = null;
    distArrays1 = null;
    removalArray = null;
}

function footOfPerpendicular(x1, y1, A, B, C) {
    let xy = {};

    if (Math.abs(A * x1 + B * y1 + C) < 1e-13) {
        xy.x = x1;
        xy.y = y1;
    }
    else {
        xy.x = (B * B * x1 - A * B * y1 - A * C) / (A * A + B * B);
        xy.y = (-A * B * x1 + A * A * y1 - B * C) / (A * A + B * B);
    }
    return xy;
}

function PointRotate(cx, cy, p1X, p1Y, angle) {
    let xy = {};
    var x1 = (p1X - cx) * Math.cos(angle) + (p1Y - cy) * Math.sin(angle) + cx;
    var y1 = -(p1X - cx) * Math.sin(angle) + (p1Y - cy) * Math.cos(angle) + cy;
    xy.x = x1;
    xy.y = y1;
    return xy;
}


// 点到直线的距离
function stra_d(p, a, b) {
    //r即点到线段的投影长度与线段长度比
    let r = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    let p1 = { x: a.x + r * (b.x - a.x), y: a.y + r * (b.y - a.y) }
    return Number(Math.sqrt(Math.pow(p1.x - p.x, 2) + Math.pow(p1.y - p.y, 2)).toFixed(2));
}

// 排序
function sort(property) {
    return function (a, b) {
        return (a[property] - b[property])
    }
}

// 计算线段与三角面的交点
function ValidPoint(v1, v2, a, b, c) {
    // 求平面的法向量
    let e1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z },
        e2 = { x: a.x - c.x, y: a.y - c.y, z: a.z - c.z },
        // 叉乘公式：c = a×b = （a.y*b.z-b.y*a.z , b.x*a.z-a.x*b.z , a.x*b.y-b.x*a.y）
        n = {
            x: e1.y * e2.z - e1.z * e2.y,
            y: e1.z * e2.x - e1.x * e2.z,
            z: e1.x * e2.y - e1.y * e2.x,
        };

    //计算常数项
    let TriD = -(n.x * a.x + n.y * a.y + n.z * a.z);
    let LineV = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };

    /*-------求解直线与平面的交点坐标---------*/
    /* 思路：
    * 首先将直线方程转换为参数方程形式，然后代入平面方程，求得参数t，
    * 将t代入直线的参数方程即可求出交点坐标
    */

    let tempU = n.x * v1.x + n.y * v1.y
        + n.z * v1.z + TriD;
    let tempD = n.x * LineV.x + n.y * LineV.y + n.z * LineV.z;


    //直线与平面平行或在平面上
    if (tempD == 0.0) {
        return false;
    }

    //计算参数t
    let t = -tempU / tempD;
    //计算交点坐标

    let CrossPoint = {
        x: LineV.x * t + v1.x,
        y: LineV.y * t + v1.y,
        z: LineV.z * t + v1.z,
    };

    /*----------判断交点是否在三角形内部---*/

    //计算三角形三条边的长度
    let d12 = Distance(a, b);
    let d13 = Distance(a, c);
    let d23 = Distance(b, c);
    //计算交点到三个顶点的长度
    let c1 = Distance(CrossPoint, a);
    let c2 = Distance(CrossPoint, b);
    let c3 = Distance(CrossPoint, c);
    //求三角形及子三角形的面积
    let areaD = Area(d12, d13, d23); //三角形面积
    let area1 = Area(c1, c2, d12); //子三角形1
    let area2 = Area(c1, c3, d13); //子三角形2
    let area3 = Area(c2, c3, d23); //子三角形3
    //根据面积判断点是否在三角形内部
    if (Math.abs(area1 + area2 + area3 - areaD) > 0.001) {
        return false;
    }

    console.log(Distance(v1, CrossPoint));


    return {
        x: Number(Distance(v1, CrossPoint).toFixed(2)),
        y: Number(CrossPoint.y.toFixed(2))
    };

}

// 三维点求距离
function Distance(p1, p2) {
    let dist = ((p2.x - p1.x) * (p2.x - p1.x)
        + (p2.y - p1.y) * (p2.y - p1.y)
        + (p2.z - p1.z) * (p2.z - p1.z));
    return Math.sqrt(dist);
}

// 三角形求面积
function Area(a, b, c) {
    let s = (a + b + c) / 2;
    return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}

// 直线与面的交点
function CalPlaneLineIntersectPoint(planeVector, planePoint, lineVector, linePoint) {

    let vp1, vp2, vp3, n1, n2, n3, v1, v2, v3, m1, m2, m3, vpt;

    vp1 = planeVector.x;
    vp2 = planeVector.y;
    vp3 = planeVector.z;

    n1 = planePoint.x;
    n2 = planePoint.y;
    n3 = planePoint.z;

    v1 = lineVector.x;
    v2 = lineVector.y;
    v3 = lineVector.z;

    m1 = linePoint.x;
    m2 = linePoint.y;
    m3 = linePoint.z;

    vpt = v1 * vp1 + v2 * vp2 + v3 * vp3;

    //首先判断直线是否与平面平行
    if (vpt == 0) {
        return false;
    } else {
        let t = ((n1 - m1) * vp1 + (n2 - m2) * vp2 + (n3 - m3) * vp3) / vpt;

        let zzz = {
            x: m1 + v1 * t,
            y: m2 + v2 * t,
            z: m3 + v3 * t,
        }

        return zzz;
    }
}