import * as THREE from '../jsm/three.module.js';
import { TWEEN } from '../jsm/libs/tween.module.min.js';

import { shipGroup } from './index';
import { rakeInfo,rakearm } from '../../requestParent';

let line_length = 4.552; // 绳索原本长度 【可通过lineScaleRotation()函数下的p1.distanceTo(p2)的第一次的值获得】

let crane_arm1_len = 7.711259235685624, crane_arm2_len = 8.887272675184624; // 耙臂第一关节，第二关节的长度 【可通过armRun()函数下的获得计算方式】

let left_group, right_group; // 左右吊架组
let left_arm_g, right_arm_g; // 左右耙臂组
let l_c_arm_g, r_c_arm_g; // 左右吊架臂组

let l_arm_joint1, l_arm_joint2, l_arm_joint3, l_arm_claw;
let r_arm_joint1, r_arm_joint2, r_arm_joint3, r_arm_claw;

let time1 = 1000, time2 = 2000, time3 = 3000;

let left_pa_x_y_angle=-1000;
let left_pa_x_z_angle=-1000;
let right_pa_x_y_angle=-1000;
let right_pa_x_z_angle=-1000;

let cu_left_copy; 
let cu_left_gz;
let cu_right_copy; 
let cu_right_gz;

let angleObj = {
    leftDragUpHorAngle: 0,
    rightDragUpHorAngle: 0,
    leftDragUpAngle: 0,
    rightDragUpAngle: 0,
    leftDragDownHorAngle: 0,
    rightDragDownHorAngle: 0,
    leftDragDownAngle: 0,
    rightDragDownAngle: 0,
    leftRunAngle: 0,
    rightRunAngle: 0,
    leftDragDepth: null,
    rightDragDepth: null,
}

function copyProperty(target, source){ 
    target.position.x = source.position.x;
    target.position.y = source.position.y;
    target.position.z = source.position.z;
    target.rotation.x = source.rotation.x;
    target.rotation.y = source.rotation.y;
    target.rotation.z = source.rotation.z;
    target.scale.x = source.scale.x;
    target.scale.y = source.scale.y;
    target.scale.z = source.scale.z;
}

function deepClone(object)
{ 
    let target = null;
    if(object.type === 'Mesh' || object.type === 'Sprite'){
        target =  new THREE.Mesh(object.geometry.clone(false), object.material.clone(false) );
    }else{
        target = object.clone( false );
    }    
    target.name = object.name;
    copyProperty(target, object);
    if(object.children && object.children.length > 0){
        object.children.forEach( child => {
            target.add(deepClone(child) );
        });
    }
    return target; 
}

function deepClone1(object)
{ 
    let target = null;
    if(object.type === 'Mesh' || object.type === 'Sprite'){
        target =  new THREE.Mesh(object.geometry.clone(false), object.material.clone(false) );
    }else{
        target = object.clone( false );
    }    
    target.name = object.name+"gz";
    copyProperty(target, object);
    if(object.children && object.children.length > 0){
        object.children.forEach( child => {
            target.add(deepClone1(child) );
        });
    }
    return target; 
}

function targetArmRotate(type, key, joint_num, direction, rad, all) {
    let object;
    if (key === '左') {
        if (joint_num === 1) {
            let ps=shipGroup.getObjectByName('左耙臂组');           
            let pala=  l_arm_joint2.getObjectByName('左耙臂拉伸组1');  
            if(!cu_left_copy)  //历史上的首次
            {
                 //拆到与上耙平级
                cu_left_copy=deepClone(l_arm_joint3);  
                cu_left_copy.name="左耙臂关节3组tk";
                cu_left_copy.scale.set(pala.scale.x,pala.scale.y,pala.scale.z);
                cu_left_copy.rotation.set(-Math.PI/2,0,0);                
                ps.add(cu_left_copy);
                //做一个用于跟踪的
                cu_left_gz=deepClone1(l_arm_joint3);
                cu_left_gz.name="左耙臂关节3组gz"
                cu_left_gz.visible=false;
                pala.add(cu_left_gz);
                //删除原来的，替换上面的
                pala.remove(l_arm_joint2.getObjectByName('左耙臂关节3组'));
                l_arm_joint3=ps.getObjectByName('左耙臂关节3组tk');
                l_arm_joint3.name="左耙臂关节3组";                 
            }   
 
            if(type=='vertical') l_arm_joint1.rotation[direction] = rad;           
            else l_arm_joint2.rotation[direction] = rad; 
            let gz=pala.getObjectByName("左耙臂关节3组gz");
            //算左标
            shipGroup.updateMatrixWorld(true);            
            var po1=new THREE.Vector3();
            gz.getWorldPosition(po1);  
            var po2=new THREE.Vector3();
            po2=ps.worldToLocal(po1);
            l_arm_joint3.position.set(po2.x,po2.y,po2.z);
        } 
        else if (joint_num === 2) 
        {
            object = l_arm_joint3;
            if (direction === "y") {
                if (all !== null) {                   
                    let rady=0;
                    if(left_pa_x_y_angle==-1000){
                        rady=rad;
                    }
                    else{
                        rady=rad-left_pa_x_y_angle;
                    }
                    left_pa_x_y_angle=rad;
                    //按照差值radx去转
                    if(rady!=0){
                       object.rotateOnAxis(new THREE.Vector3(Math.sin(all.LBz),Math.cos(all.LBz),0),rady);
                    }
                }
            }
            if (direction === "z") {
                    let radz=0;
                    if(left_pa_x_z_angle==-1000){
                        radz=rad;
                    }
                    else{
                        radz=rad-left_pa_x_z_angle;
                    }
                    left_pa_x_z_angle=rad;
                    //按照差值radx去转
                    if(radz!=0){
                       object.rotateOnAxis(new THREE.Vector3(0,0,1),radz);
                       //rotateAroundWorldAxis(object, new THREE.Vector3(0,0,1), radz);
                    }
            }
        } else if (joint_num === 3) {
            object = l_arm_claw;
            object.rotation[direction] = rad;
        }
    } else if (key === '右') {
        if (joint_num === 1) {
            let ps=shipGroup.getObjectByName('右耙臂组');           
            let pala=  r_arm_joint2.getObjectByName('右耙臂拉伸组1');  
            if(!cu_right_copy)  //历史上的首次
            {
                 //拆到与上耙平级
                cu_right_copy=deepClone(r_arm_joint3);  
                cu_right_copy.name="右耙臂关节3组tk";
                cu_right_copy.scale.set(pala.scale.x,pala.scale.y,pala.scale.z);
                cu_right_copy.rotation.set(-Math.PI/2,0,0);                
                ps.add(cu_right_copy);
                //做一个用于跟踪的
                cu_right_gz=deepClone1(r_arm_joint3);
                cu_right_gz.name="右耙臂关节3组gz"
                cu_right_gz.visible=false;
                pala.add(cu_right_gz);
                //删除原来的，替换上面的
                pala.remove(r_arm_joint2.getObjectByName('右耙臂关节3组'));
                r_arm_joint3=ps.getObjectByName('右耙臂关节3组tk');
                r_arm_joint3.name="右耙臂关节3组";                 
            }   
            else{                
                //console.log("二次");
            }     
            if(type=='vertical') r_arm_joint1.rotation[direction] = rad;           
            else r_arm_joint2.rotation[direction] = rad; 
            let gz=pala.getObjectByName("右耙臂关节3组gz");
            //算左标
            shipGroup.updateMatrixWorld(true);            
            var po1=new THREE.Vector3();
            gz.getWorldPosition(po1);  
            // console.log("假肢world:",JSON.stringify(po1)); 
            var po2=new THREE.Vector3();
            po2=ps.worldToLocal(po1);
            r_arm_joint3.position.set(po2.x,po2.y,po2.z);           
        }  else if (joint_num === 2) {
            object = r_arm_joint3;
            //object.rotation[direction] = rad;
            if (direction === "y") {
                if (all !== null) {
                    let rady=0;
                    if(right_pa_x_y_angle==-1000)
                    {
                        rady=rad;
                    }
                    else{
                        rady=rad-right_pa_x_y_angle;
                    }
                    right_pa_x_y_angle=rad;
                    //按照差值radx去转
                    if(rady!=0){
                       object.rotateOnAxis(new THREE.Vector3(Math.sin(all.RBz),Math.cos(all.RBz),0),rady);
                    }
                }
            }
            if (direction === "z") {
                let radz=0;
                if(right_pa_x_z_angle==-1000){
                    radz=rad;
                }
                else{
                    radz=rad-right_pa_x_z_angle;
                }
                right_pa_x_z_angle=rad;
                //按照差值radx去转
                if(radz!=0){
                   object.rotateOnAxis(new THREE.Vector3(0,0,1),radz);
                }
            }
        } else if (joint_num === 3) {
            object = r_arm_claw;
            object.rotation[direction] = rad;
        }
    }
    if (joint_num === 1) { // 第一关节旋转，【会带动第二关节故而两者都要考虑变化】
        lineScaleRotation(key, '1');
        lineScaleRotation(key, '2');
    } else if (joint_num === 2) { // 第二关节旋转
        lineScaleRotation(key, '2');
    }
    // 爪头的旋转不需要线联动
}

function runRank(screenData){
    debugger
    console.log(screenData);
    console.log(angleObj);
    for (let angle in angleObj){
        screenData.forEach(e=>{
            if (e[angle] !== undefined){  // 判断是否有对应的属性
                console.log(typeof(e[angle]) == "string")
                if(typeof(e[angle]) == "string") {
                    if(Number(e[angle])) {
                        angleObj[angle] = Number(e[angle]);
                    } else {
                        angleObj[angle] = 0;
                    }
                } else {
                    angleObj[angle] = e[angle];
                }
            }
        })
    }
    console.log(angleObj);
    // //左、右  竖向  上耙
    // actionArm('vertical', '左',1, angleObj.leftDragUpAngle * Math.PI / 180, 0);
    // actionArm('vertical', '右',1, angleObj.rightDragUpAngle * Math.PI / 180, 0);
    // //左、右  水平  上耙
    // actionArm('horizontal', '左',1, 0, -angleObj.leftDragUpHorAngle * Math.PI / 180);
    // actionArm('horizontal', '右',1, 0, angleObj.rightDragUpHorAngle * Math.PI / 180);
    // //左、右 竖向+水平  下耙
    // actionArm(0, '左', 2, (angleObj.leftDragDownAngle - angleObj.leftDragUpAngle) * Math.PI / 180, -angleObj.leftDragDownHorAngle * Math.PI / 180);
    // actionArm(0, '右', 2, (angleObj.rightDragDownAngle - angleObj.rightDragUpAngle) * Math.PI / 180, angleObj.rightDragDownHorAngle * Math.PI / 180);
    // //活动罩
    // actionArm(0, '左', 3, (-angleObj.leftRunAngle) * Math.PI / 180, 0);
    // actionArm(0, '右', 3, (-angleObj.rightRunAngle) * Math.PI / 180, 0);
    let nodeMap={};
    nodeMap['左耙上耙管垂直角度']= angleObj.leftDragUpAngle;
    nodeMap['左耙上耙管水平角度']=angleObj.leftDragUpHorAngle;
    nodeMap['左耙下耙管垂直角度']=angleObj.leftDragDownAngle;
    nodeMap['左耙下耙管水平角度']=angleObj.leftDragDownHorAngle;

    nodeMap['右耙上耙管垂直角度']=angleObj.rightDragUpAngle;
    nodeMap['右耙上耙管水平角度']=angleObj.rightDragUpHorAngle;
    nodeMap['右耙下耙管垂直角度']=angleObj.rightDragDownAngle;
    nodeMap['右耙下耙管水平角度']=angleObj.rightDragDownHorAngle;

    nodeMap['左耙活动罩角度']=angleObj.leftRunAngle;
    nodeMap['右耙活动罩角度']=angleObj.rightRunAngle;

    nodeMap['左吸口到位']=1;
    nodeMap['右吸口到位']=1;
    rakearm(nodeMap);
}

function actionArm(type, key, joint_num, value1, value2, nextCallback) {
    debugger
    let object;
    if (key === '左') {
        if (joint_num === 1) {
            object = type === 'vertical' ? l_arm_joint1 : l_arm_joint2;
            let vz = object.rotation.z, vy = object.rotation.y;
            if (tval.LTz === value1 && tval.LTy === value2) return;
            // 如果是垂直旋转，只修改right_top_z轴数据; 如果是水平旋转，只修改right_top_y
            if (type === 'vertical' && object === l_arm_joint1) tval.LTz = value1;
            if (type === 'horizontal' && object === l_arm_joint2) tval.LTy = value2;
            targetArmRotate(type,key, joint_num, 'z', value1,tval);
            targetArmRotate(type,key, joint_num, 'y', value2,tval);            
        } else if (joint_num === 2) {
            object = l_arm_joint3;
            let vz = object.rotation.z, vy = object.rotation.y;
            if (value1 === tval.LBz && tval.LBy === value2) return;
            tval.LBz = value1;
            tval.LBy = value2;
            targetArmRotate(type, key, joint_num, 'z', value1, tval);
            targetArmRotate(type, key, joint_num, 'y', value2, tval);
        }
    } else if (joint_num === 3) {
        object = l_arm_claw;
        let vz = object.rotation.z;
        if (vz === value1) return;
        vz = value1;
        console.log("活动罩角度L", value1)
        new TWEEN.Tween({vz})
            .to({
                vz: value1,
            }, 1000)
            .start()
            .onUpdate(function () { // 更新时执行的回调
                let obj = this._object;
                targetArmRotate(type, key, joint_num, 'z', obj.vz);
            })
            .onComplete(() => { // 结束时执行的回调
                if (nextCallback) nextCallback();
            });
    } else if (key === '右') {
        if (joint_num === 1) {
            object = type === 'vertical' ? r_arm_joint1 : r_arm_joint2;
            let vz = object.rotation.z, vy = object.rotation.y;
            if (tval.RTz === value1 && tval.RTy === value2) return;
            if (type === 'vertical' && object === r_arm_joint1) tval.RTz = value1;
            if (type === 'horizontal' && object === r_arm_joint2) tval.RTy = value2;
            targetArmRotate(type, key, joint_num, 'z', value1,tval);
            targetArmRotate(type, key, joint_num, 'y', value2,tval);
           
        } else if (joint_num === 2) {
            object = r_arm_joint3;
            let vz = object.rotation.z, vy = object.rotation.y;
            if (value1 === tval.RBz && tval.RBy === value2) return;
            tval.RBz = value1;
            tval.RBy = value2;
            targetArmRotate(type, key, joint_num, 'z', value1, tval);
            targetArmRotate(type, key, joint_num, 'y', value2, tval);
            
        } else if (joint_num === 3) {
            object = r_arm_claw;
            let vz = object.rotation.z;
            if (vz === value1) return;
            vz = value1;
            console.log("活动罩角度R", value1)
            new TWEEN.Tween({vz})
                .to({
                    vz: value1,
                }, 1000)
                .start()
                .onUpdate(function () { // 更新时执行的回调
                    let obj = this._object;
                    targetArmRotate(type, key, joint_num, 'z', obj.vz);
                })
                .onComplete(() => { // 结束时执行的回调
                    if (nextCallback) nextCallback();
                });
        }
    }
}

// ===绞车的缆线的缩放 和 旋转===
function lineScaleRotation(key, numString) {

    shipGroup.updateMatrixWorld(true);
    // let inverseMatrix = new THREE.Matrix4().getInverse(shipGroup.matrixWorld);

    let p1 = shipGroup.getObjectByName(key + '绞车' + numString).getObjectByName('绞车臂组').getObjectByName('绞车绳索').getWorldPosition(new THREE.Vector3());
    let p2 = shipGroup.getObjectByName(key + '吊架组').getObjectByName(key + '耙臂吊点' + numString).getWorldPosition(new THREE.Vector3());

    // p1.applyMatrix4(inverseMatrix);
    // p2.applyMatrix4(inverseMatrix);

    let line = shipGroup.getObjectByName(key + '绞车' + numString).getObjectByName('绞车臂组').getObjectByName('绞车拉伸绳索');

    line.scale.z = p1.distanceTo(p2) / line_length; // line_length 的初始值，可以由p1.distanceTo(p2)的第一次的值计算的出

    line.lookAt(p2);

}


// ===吊车旋转臂===
function getCraneArmParams(key) {

    let c_arm_g, arm_g;

    if (key === '左') {
        c_arm_g = l_c_arm_g;
        arm_g = left_arm_g;
    } else if (key === '右') {
        c_arm_g = r_c_arm_g;
        arm_g = right_arm_g;
    }

    shipGroup.updateMatrixWorld(true);
    let inverseMatrix = new THREE.Matrix4().getInverse(shipGroup.matrixWorld);

    let obj1 = c_arm_g.getObjectByName(key + '吊架臂关节1组');

    let obj2 = c_arm_g.getObjectByName(key + '吊架臂关节2');

    let obj3 = arm_g.getObjectByName(key + '耙臂托');

    let op1 = obj1.getWorldPosition(new THREE.Vector3());
    let op2 = obj2.getWorldPosition(new THREE.Vector3());
    let op3 = obj3.getWorldPosition(new THREE.Vector3());

    op1.applyMatrix4(inverseMatrix);
    op2.applyMatrix4(inverseMatrix);
    op3.applyMatrix4(inverseMatrix);

    let oa = op1.distanceTo(op2);
    let ob = op2.distanceTo(op3);
    let oc = op3.distanceTo(op1);

    let oacosB = Math.acos((oa * oa + oc * oc - ob * ob) / (2 * oa * oc));

    let oacosC = Math.acos((oa * oa + ob * ob - oc * oc) / (2 * oa * ob));

    let rx1 = obj1.rotation.x;
    let rx2 = obj2.rotation.x;

    return { oc, op3, oacosB, oacosC, rx1, rx2 };
}

function armRun(key, { oc, op3, oacosB, oacosC, rx1, rx2 }, num = 1) {

    let c_arm_g, arm_g;

    if (key === '左') {
        c_arm_g = l_c_arm_g;
        arm_g = left_arm_g;
    } else if (key === '右') {
        c_arm_g = r_c_arm_g;
        arm_g = right_arm_g;
    }

    shipGroup.updateMatrixWorld(true);
    let inverseMatrix = new THREE.Matrix4().getInverse(shipGroup.matrixWorld);

    let p1 = c_arm_g.getObjectByName(key + '吊架臂关节1组').getWorldPosition(new THREE.Vector3());
    let p3 = arm_g.getObjectByName(key + '耙臂托').getWorldPosition(new THREE.Vector3());

    p1.applyMatrix4(inverseMatrix);
    p3.applyMatrix4(inverseMatrix);

    op3.x = p3.x;
    let oa = op3.distanceTo(p3);
    let ob = p1.distanceTo(p3);

    // 用于计算耙臂的2个关节的长度 crane_arm1_len, crane_arm2_len
    // let ppp1 = c_arm_g.getObjectByName(key + '吊架臂关节1组').getObjectByName(key + '吊架臂关节2').getWorldPosition(new THREE.Vector3());
    // console.log(p1.distanceTo(ppp1),ppp1.distanceTo(p3)); // 第一次的值就是 crane_arm1_len, crane_arm2_len的初始长度


    let oacosA = Math.acos((ob * ob + oc * oc - oa * oa) / (2 * ob * oc)) * num || 0;

    let a = crane_arm1_len, b = crane_arm2_len, c = p1.distanceTo(p3);

    let aa = a * a, bb = b * b, cc = c * c;

    let acosB = Math.acos((aa + cc - bb) / (2 * a * c));

    let r1 = rx1 + oacosA + acosB - oacosB;

    let acosC = Math.acos((aa + bb - cc) / (2 * a * b));
    let r2 = rx2 + acosC - oacosC;

    c_arm_g.getObjectByName(key + '吊架臂关节1组').rotation.x = r1;
    c_arm_g.getObjectByName(key + '吊架臂关节2').rotation.x = r2;

}

/**
 *
 * @param {*} key 左右
 * @param {*} joint_num 关节号
 * @param {*} value1 垂直方向值
 * @param {*} value2 水平方向值
 * @param {*} nextCallback 回调
 */
let tval = { LTz: 0, LTy: 0, LBz: 0, LBy: 0, RTz: 0, RTy: 0, RBz: 0, RBy: 0 };

let Ltemp = { LTz: 0, LTy: 0, LBz: 0, LBy: 0, RTz: 0, RTy: 0, RBz: 0, RBy: 0 };
function actionArmUp(index, key, value1, value2, time = 1000, nextCallback) {
    // index此处为判断旋转方向，方向分为垂直旋转和水平旋转，由RightWInWarpFree.jsx文件可知，但index为1和3时表示调整垂直角度，为4和6时调整水平角度
    let object;
    if (key === '左') {
        object = l_arm_joint2; // 调整水平旋转时的原点为l_arm_joint2
        if (index === 1 || index === 3) object = l_arm_joint1;  // 垂直旋转时，原点为l_arm_joint1
        let vz = object.rotation.z, vy = object.rotation.y;
        if (Ltemp.LTz === value1 && Ltemp.LTy === value2) return;
        Ltemp.LTz = value1;
        Ltemp.LTy = value2;
        new TWEEN.Tween({ vz, vy })
            .to({
                vz: value1,
                vy: value2,
            }, time)
            .start()
            .onUpdate(function () { // 更新时执行的回调
                let obj = this._object;
                targetUpArmRotate(index, '左', 'z', obj.vz);
                targetUpArmRotate(index, '左', 'y', obj.vy);
            })
            .onComplete(() => { // 结束时执行的回调
                if (nextCallback) nextCallback();
            });
    } else if (key === '右') {
        object = r_arm_joint2; // 调整水平旋转时的原点为r_arm_joint2
        if (index === 1 || index === 3) object = r_arm_joint1; // 垂直旋转时，原点为r_arm_joint1
        let vz = object.rotation.z, vy = object.rotation.y;
        if (Ltemp.RTz === value1 && Ltemp.RTy === value2) return;
        Ltemp.RTz = value1;
        Ltemp.RTy = value2;
        new TWEEN.Tween({ vz, vy })
            .to({
                vz: value1,
                vy: value2,
            }, time)
            .start()
            .onUpdate(function () { // 更新时执行的回调
                let obj = this._object;
                targetUpArmRotate(index, '右', 'z', obj.vz);
                targetUpArmRotate(index, '右', 'y', obj.vy);
            })
            .onComplete(() => { // 结束时执行的回调
                if (nextCallback) nextCallback();
            });
    }
}
function actionArmDown(index, key, value1, value2, time = 1000, nextCallback) {
    // debugger
    // index此处为判断旋转方向，方向分为垂直旋转和水平旋转，由RightWInWarpFree.jsx文件可知，但index为1和3时表示调整垂直角度，为4和6时调整水平角度
    let object;
    if (key === '左') {
        object = l_arm_joint3;
        if (Ltemp.LBz === value1 && Ltemp.LBy === value2) return;
        Ltemp.LBz = value1;
        Ltemp.LBy = value2;
        l_arm_joint3.rotation['z'] = 0;
        l_arm_joint2.rotation['y'] = 0;
        if (index === 1 || index === 3) {
            l_arm_joint1.rotation['y'] = 0;
            l_arm_joint1.rotation['z'] = 0;
        }
        l_arm_joint3.rotation['z'] = 0;
        l_arm_joint3.rotation['y'] = 0;
        l_arm_claw.rotation['z'] = 0;
        l_arm_claw.rotation['y'] = 0;
        object.rotation['x'] = 0;
        targetUpArmRotate(index, key, 'z', Ltemp.LTz);
        targetUpArmRotate(index, key, 'y', Ltemp.LTy);
        targetDownArmRotate(key, 'z', Ltemp.LBz);
        targetDownArmRotate(key, 'y', Ltemp.LBy);
    } else if (key === '右') {
        object = r_arm_joint3;
        if (Ltemp.RBz === value1 && Ltemp.RBy === value2) return;
        Ltemp.RBz = value1;
        Ltemp.RBy = value2;
        r_arm_joint3.rotation['z'] = 0;
        r_arm_joint2.rotation['y'] = 0;
        if (index === 1 || index === 3) {
            r_arm_joint1.rotation['y'] = 0;
            r_arm_joint1.rotation['z'] = 0;
        }
        r_arm_joint3.rotation['z'] = 0;
        r_arm_claw.rotation['z'] = 0;
        r_arm_joint3.rotation['y'] = 0;
        r_arm_claw.rotation['y'] = 0;
        object.rotation['x'] = 0;
        targetUpArmRotate(index, key, 'z', Ltemp.RTz);
        targetUpArmRotate(index, key, 'y', Ltemp.RTy);
        targetDownArmRotate(key, 'z', Ltemp.RBz);
        targetDownArmRotate(key, 'y', Ltemp.RBy);
    }
}
function targetUpArmRotate(index, key, direction, rad){
    let object;
    if (key === '左') {
        object = l_arm_joint2; // 调整水平旋转时的原点为l_arm_joint2
        if (index === 1 || index === 3) object = l_arm_joint1; // 垂直旋转时，原点为l_arm_joint1
        object.rotation[direction] = rad;
    } else if (key === '右') {
        object = r_arm_joint2; // 调整水平旋转时的原点为r_arm_joint2
        if (index === 1 || index === 3) object = r_arm_joint1; // 垂直旋转时，原点为r_arm_joint1
        object.rotation[direction] = rad;
    }
    lineScaleRotation(key, '1');
    lineScaleRotation(key, '2');
}
function targetDownArmRotate(key, direction, rad) {
    let object;
    if (key === '左') {
        object = l_arm_joint3;
        if (direction === "y") {
            //钱鑫：耙角度
            let DAngle = Ltemp.LBz + Ltemp.LTz;
            let axis = new THREE.Vector3(Math.tan(DAngle), 1, 0);//向量axis
            // 如果是第一次不需要归位
            object.rotateOnAxis(axis, rad);
        }
        if (direction === "z") {
            object.rotation[direction] = rad;
        }
    } else if (key === '右') {
        object = r_arm_joint3;
        if (direction === "y") {
            let DAngle = Ltemp.RBz + Ltemp.RTz;
            let axis = new THREE.Vector3(Math.tan(DAngle), 1, 0);//向量axis
            // 如果是第一次不需要归位
            object.rotateOnAxis(axis, rad);
        }
        if (direction === "z") {
            object.rotation[direction] = rad;
        }
    }
    lineScaleRotation(key, '2');
}
function targetHeadArm(key, rad) {
    console.log(key, rad)
    let object;
    if (key === '左') {
        object = l_arm_claw;
        let vz = object.rotation.z;
        if (vz === rad) return;
        vz = rad;
        object.rotation['z'] = -rad;
        console.log(object.rotation['z'])
    }else{
        object = r_arm_claw;
        let vz = object.rotation.z;
        if (vz === rad) return;
        vz = rad;
        object.rotation['z'] = -rad;
    }
}
// =================================重置耙臂=================================
function resetArm(key, time = 2000, nextCallback) {
    let v1, v2, v3, v4, v5, v6;

    if (key === '左') {
        v1 = l_arm_joint1.rotation.z;
        v2 = l_arm_joint3.rotation.z;
        v3 = l_arm_claw.rotation.z;

        v4 = l_arm_joint1.rotation.y;
        v5 = l_arm_joint3.rotation.y;
        v6 = l_arm_claw.rotation.y;
    } else {
        v1 = r_arm_joint1.rotation.z;
        v2 = r_arm_joint3.rotation.z;
        v3 = r_arm_claw.rotation.z;

        v4 = r_arm_joint1.rotation.y;
        v5 = r_arm_joint3.rotation.y;
        v6 = r_arm_claw.rotation.y;
    }

    new TWEEN.Tween({ v1, v2, v3, v4, v5, v6 })
        .to({
            v1: 0, v2: 0, v3: 0, v4: 0, v5: 0, v6: 0
        }, time)
        .start()
        .onUpdate(function () { // 更新时执行的回调

            let obj = this._object;

            targetArmRotate(0, key, 1, 'z', obj.v1);
            targetArmRotate(0, key, 2, 'z', obj.v2, null);
            targetArmRotate(0, key, 3, 'z', obj.v3);

            targetArmRotate(0, key, 1, 'y', obj.v4);
            targetArmRotate(0, key, 2, 'y', obj.v5, null);
            targetArmRotate(0, key, 3, 'y', obj.v6);

        })
        .onComplete(() => { // 结束时执行的回调
            if (nextCallback) nextCallback();
        });

}

// =================================第一阶段=================================
// 绞车和吊架拉绳，耙臂脱离搁墩上升
/**
 *
 * @param {*} key 键名 区分左右
 * @param {*} z_val z值 用于提升高度的量 【模型问题，该部件在模型空间内 向上是:Z坐标减 ，向下是:Z坐标加】
 * @param {*} armRun_i
 * @param {*} nextCallback
 */
function Action1({ key, z_val, armRun_i }, nextCallback) {

    let arm_g = key === '左' ? left_arm_g : right_arm_g;

    const armParams = getCraneArmParams(key); // 获取吊架臂运作需要的参数

    const { z } = arm_g.position;
    z_val += z;

    new TWEEN.Tween({ z })
        .to({
            z: z_val
        }, time1)
        .start()
        .onUpdate(function () { // 更新时执行的回调
            let obj = this._object;

            arm_g.position.z = obj.z; // 左臂上升

            armRun(key, armParams, armRun_i); //

            lineScaleRotation(key, '1');
            lineScaleRotation(key, '2');

        })
        .onComplete(() => { // 结束时执行的回调
            if (nextCallback) nextCallback();
        });

}

// =================================第二阶段=================================
let deg = 180 / Math.PI;
let rad1 = Math.PI / 180;
let rad20 = rad1 * 20;

let cradleTowData = {
    '左': {
        oA: 22.14,
        oB: 128.15,
        oC: 29.61,
        b: 2.6032670483865776,
        c: 1.6377377151166517,
        i: 1,
    },
    '右': {
        oA: 23.61,
        oB: 124.89,
        oC: 31.5,
        b: 2.603269412439863,
        c: 1.6583478538447403,
        i: -1,
    },
}

// ===吊架的撑杆旋转函数===
function cradleTowRotateX(key, edge, rot) {

    const { oA, oB, oC, b, c, i } = cradleTowData[key];

    let Rangle = rot / rad1; // 旋转的角度 【-90°后为旋转后的实际角度】
    let cosA = Math.cos((oA + Rangle) * rad1);
    let a = Math.sqrt((c * c) + (b * b) - (2 * c * b * cosA));

    let aa = a * a, bb = b * b, cc = c * c;

    if (edge === 'b') {

        let acosB = Math.acos((aa + cc - bb) / (2 * a * c));
        return (acosB * deg - oB) * rad1 * i;

    } else if (edge === 'c') {

        let acosC = Math.acos((aa + bb - cc) / (2 * a * b));
        return (oC - acosC * deg) * rad1 * i;

    }

}

// ===吊架的撑杆旋转函数===
function winchTowRotateX(edge, rot) {

    let oA = 11.58, // 初始∠A的值
        oB = 149.5, // 初始∠B的值
        oC = 18.88; // 初始∠C的值

    let a = 1.277, b = 3.225;

    let c = (angle) => {
        let cosC = Math.cos((oC + angle) * rad1);
        return Math.sqrt((a * a) + (b * b) - (2 * a * b * cosC));
    }

    let edge_len;
    if (edge === 'a') {
        edge_len = a;
    } else if (edge === 'b') {
        edge_len = b;
    }

    let angle = rot / rad1; // 旋转的角度
    let sinC = Math.sin((oC + angle) * rad1); // 获得∠C角度的sin值

    let sin = sinC * edge_len / c(angle); // 正弦定理 推测出对应边的sin值

    let asin = Math.asin(sin);

    if (edge === 'a') {
        // return (-90 + (asin * deg - 11.58)) * rad1;
        return (asin * deg - oA - 90) * rad1;
    } else if (edge === 'b') {
        // return (149.5 - (180 - (asin * deg))) * rad1;
        return (oB - 180 + (asin * deg)) * rad1;
    }

}

// 绞车和吊架“低头”，耙臂被转至船舷外
function Action2({ key, y_val, z_val, rad_i, armRun_i }, nextCallback) {

    const armParams = getCraneArmParams(key); // 获取吊架臂运作需要的参数

    let group, arm_g, index = 1;

    if (key === '左') {
        group = left_group;
        arm_g = left_arm_g;
        index = -1;
    } else {
        group = right_group;
        arm_g = right_arm_g;
    }

    const rotate1 = group.getObjectByName(key + '吊架旋转1组');
    const rotate2 = group.getObjectByName(key + '吊架旋转2组');
    const rotate1_tow = rotate1.getObjectByName(key + '吊架旋转体支架');
    const rotate2_top = rotate2.getObjectByName(key + '吊架顶组');

    const tow = group.getObjectByName(key + '吊架固定支架');

    const winch1 = shipGroup.getObjectByName(key + '绞车1');
    const winch2 = shipGroup.getObjectByName(key + '绞车2');

    const tow_winch1 = winch1.getObjectByName('绞车底座组').getObjectByName('绞车底座支架');
    const tow_winch2 = winch2.getObjectByName('绞车底座组').getObjectByName('绞车底座支架');
    const arm_winch1 = winch1.getObjectByName('绞车臂组');
    const arm_winch2 = winch2.getObjectByName('绞车臂组');

    const rx1 = rotate2.rotation.x;
    const rx2 = rotate2_top.rotation.x;
    const rx3 = rotate1.rotation.x;

    const { y, z } = arm_g.position;

    y_val += y;
    z_val += z;

    const rx4 = arm_winch1.rotation.x;
    const rx5 = arm_winch2.rotation.x;

    new TWEEN.Tween({
        rx1, rx2, rx3, y, z, rx4, rx5
    })
        .to({
            // 耙臂组
            y: y_val,
            z: z_val,
            // 吊架
            rx1: rx1 + index * rad20 * rad_i,
            rx2: rx2 - index * rad20 * rad_i,
            rx3: rx3 + index * rad20 * rad_i,
            // 绞车
            rx4: rx4 + rad20 * rad_i,
            rx5: rx5 + rad20 * rad_i,
        }, time2)
        .start()
        .onUpdate(function () { // 更新时执行的回调
            let obj = this._object;

            // 耙臂组
            arm_g.position.y = obj.y;
            arm_g.position.z = obj.z;

            // 吊架类
            // 吊架旋转臂
            armRun(key, armParams, armRun_i);
            // 吊架旋转体
            rotate2.rotation.x = obj.rx1;
            rotate2_top.rotation.x = obj.rx2;
            rotate1.rotation.x = obj.rx3;
            // 吊架旋转托
            tow.rotation.x = cradleTowRotateX(key, 'b', index * obj.rx3);
            rotate1_tow.rotation.x = cradleTowRotateX(key, 'c', index * obj.rx3);

            // 绞车
            // 绞车体
            arm_winch1.rotation.x = obj.rx4;
            arm_winch2.rotation.x = obj.rx5;
            // 绞车吊线
            lineScaleRotation(key, '1');
            lineScaleRotation(key, '2');
            // 绞车支架托
            tow_winch1.rotation.x = winchTowRotateX('b', obj.rx4);
            arm_winch1.getObjectByName('绞车臂支架').rotation.x = winchTowRotateX('a', obj.rx4);
            tow_winch2.rotation.x = winchTowRotateX('b', obj.rx5);
            arm_winch2.getObjectByName('绞车臂支架').rotation.x = winchTowRotateX('a', obj.rx5);

        })
        .onComplete(() => { // 结束时执行的回调
            if (nextCallback) nextCallback();
        });
}

// =================================第三阶段=================================

function Action3({ key, z_val, armRun_i }, nextCallback) {
    const armParams = getCraneArmParams(key); // 获取吊架臂运作需要的参数

    let arm_g = key === '左' ? left_arm_g : right_arm_g;

    const { z } = arm_g.position;
    // z_val += z;

    // const rx1 = shipGroup.getObjectByName(key + '绞车1').getObjectByName('绞车臂组').rotation.x;
    // const rx2 = shipGroup.getObjectByName(key + '绞车2').getObjectByName('绞车臂组').rotation.x;

    new TWEEN.Tween({ z })
        .to({
            z: z_val
        }, time3)
        .start()
        .onUpdate(function () { // 更新时执行的回调
            let obj = this._object;

            arm_g.position.z = obj.z;

            armRun(key, armParams, armRun_i);

            lineScaleRotation(key, '1');
            lineScaleRotation(key, '2');

        })
        .onComplete(() => { // 结束时执行的回调
            if (nextCallback) nextCallback();
        });
}

// =================================吊架启动=================================
function leftAction(action, succeed, error) {

    if (!left_group) left_group = shipGroup.getObjectByName('左吊架组');

    if (left_group) {
        if (!left_arm_g) left_arm_g = left_group.getObjectByName('左耙臂组');
        if (!l_c_arm_g) l_c_arm_g = left_group.getObjectByName('左吊架臂组');

        if (!l_arm_joint1) l_arm_joint1 = left_arm_g.getObjectByName('左耙臂关节1组');
        if (!l_arm_joint3) l_arm_joint3 = left_arm_g.getObjectByName('左耙臂关节3组');

        if (!l_arm_claw) l_arm_claw = l_arm_joint3.getObjectByName('左耙头爪组');

        if (action === '下降') {
            Action1(
                { key: '左', z_val: -10, armRun_i: 1 },
                () => {
                    Action2(
                        { key: '左', y_val: -140, z_val: 10, rad_i: 1, armRun_i: -1 },
                        () => {
                            Action3(
                                { key: '左', z_val: 930, armRun_i: -1 },
                                succeed
                            )
                        })
                })
        } else if (action === '上升') {
            // $(folder1.domElement).hide();
            resetArm('左', 2000, () => {
                Action3(
                    { key: '左', z_val: -930, armRun_i: 1 },
                    () => {
                        Action2(
                            { key: '左', y_val: 180, z_val: -10, rad_i: -1, armRun_i: 1 },
                            () => {
                                Action1(
                                    { key: '左', z_val: 50, armRun_i: -1 },
                                    succeed
                                )
                            })
                    })
            });

        }

    } else {
        error();
    }

}

function rightAction(action, succeed, error) {
    if (!right_group) right_group = shipGroup.getObjectByName('右吊架组');

    if (right_group) {
        if (!right_arm_g) right_arm_g = right_group.getObjectByName('右耙臂组');
        if (!r_c_arm_g) r_c_arm_g = right_group.getObjectByName('右吊架臂组');

        if (!r_arm_joint1) r_arm_joint1 = right_arm_g.getObjectByName('右耙臂关节1组');
        if (!r_arm_joint3) r_arm_joint3 = right_arm_g.getObjectByName('右耙臂关节3组');
        if (!r_arm_claw) r_arm_claw = r_arm_joint3.getObjectByName('右耙头爪组');

        if (action === '下降') {
            Action1(
                { key: '右', z_val: -50, armRun_i: 1 },
                () => {
                    Action2(
                        { key: '右', y_val: 180, z_val: 10, rad_i: 1, armRun_i: -1 },
                        () => {
                            Action3(
                                { key: '右', z_val: 930, armRun_i: -1 },
                                succeed
                            )
                        })
                })
        } else if (action === '上升') {
            // $(folder2.domElement).hide();
            resetArm('右', 2000, () => {
                Action3(
                    { key: '右', z_val: -930, armRun_i: 1 },
                    () => {
                        Action2(
                            { key: '右', y_val: -180, z_val: -10, rad_i: -1, armRun_i: 1 },
                            () => {
                                Action1(
                                    { key: '右', z_val: 50, armRun_i: -1 },
                                    succeed
                                )
                            })
                    })
            });
        }
    } else {
        error();
    }
}

// 设置耙臂的参数
function initRakeParams() {
    left_group = shipGroup.getObjectByName('左吊架组');

    left_arm_g = left_group.getObjectByName('左耙臂组');
    l_c_arm_g = left_group.getObjectByName('左吊架臂组');

    l_arm_joint1 = left_arm_g.getObjectByName('左耙臂关节1组');
    l_arm_joint2 = left_arm_g.getObjectByName('左耙臂关节2组');
    l_arm_joint3 = left_arm_g.getObjectByName('左耙臂关节3组');

    l_arm_claw = l_arm_joint3.getObjectByName('左耙头爪组');

    right_group = shipGroup.getObjectByName('右吊架组');

    right_arm_g = right_group.getObjectByName('右耙臂组');
    r_c_arm_g = right_group.getObjectByName('右吊架臂组');

    r_arm_joint1 = right_arm_g.getObjectByName('右耙臂关节1组');
    r_arm_joint2 = right_arm_g.getObjectByName('右耙臂关节2组');
    r_arm_joint3 = right_arm_g.getObjectByName('右耙臂关节3组');
    r_arm_claw = r_arm_joint3.getObjectByName('右耙头爪组');

    rakeInfo.ready = true;
}

// 上升下降动作
function rakeAction1(action, key, callbak) {
    if (action === '上升') {
        Action1({ key, z_val: -50, armRun_i: 1 }, callbak)
    } else if (action === '下降') {
        Action1({ key, z_val: 50, armRun_i: -1 }, callbak)
    }
}

// 内放外放动作
function rakeAction2(action, key) {
    if (action === '外放') {
        let y_val = (key === '左') ? -180 : 180;
        Action2(
            { key, y_val, z_val: 10, rad_i: 1, armRun_i: -1 },
            () => {
                Action3({ key, z_val: 930, armRun_i: -1 })
            })

    } else if (action === '内放') {
        let y_val = (key === '左') ? 180 : -180;
        resetArm(key, 2000, () => {
            Action3(
                { key, z_val: -930, armRun_i: 1 },
                () => {
                    Action2({ key, y_val, z_val: -10, rad_i: -1, armRun_i: 1 })
                })
        });
    }
}

// =================================待操作状态=================================
// function awaitOrders(key) {
//     console.log('开始待命');
//     time1 = time2 = time3 = 1;
//     leftAction('下降', () => { }, () => { });
//     rightAction('下降', () => {
//         time1 = 1000; time2 = 2000; time3 = 3000;
//         console.log('开始结束');
//     }, () => { });
// }

// 上升状态
function riseState(key) {
    time1 = 1;
    rakeAction1('上升', key, () => {
        time1 = 1000;
    })
}

// 外放状态
function releaseState(key) {
    time1 = time2 = time3 = 1;
    if (key === '左') {
        leftAction('下降', () => {
            time1 = 1000; time2 = 2000; time3 = 3000;
        }, () => { });
    } else if (key === '右') {
        rightAction('下降', () => {
            time1 = 1000; time2 = 2000; time3 = 3000;
        }, () => { });
    }
}

export {
    initRakeParams, // 设置耙臂参数

    rakeAction1,
    rakeAction2,

    riseState, // 上升状态
    releaseState, // 外放状态

    runRank,
    actionArm,  // 耙臂旋转
    actionArmUp,
    actionArmDown,
    targetHeadArm,
    lineScaleRotation,//更新吊索连接
};
