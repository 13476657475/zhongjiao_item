import React, {Children, Component} from 'react';
import {connect} from 'react-redux';
import store from '../../../redux/store';
import {LinkOutlined, DisconnectOutlined} from '@ant-design/icons';
import {actionArm, actionArmUp, actionArmDown, targetHeadArm, runRank} from '../../main/3d/ship/robotic-arm';
import {valiNumber} from '../../../utils/validate'
import {Select} from "antd";
import {changeDepth, GUID, upLandData} from "../../main/3d/scene";
import {GPSInfo} from "../../main/requestParent";
import ReactDOM from "react-dom"

// 自由模拟窗口
class RightWinWrapFree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            isClose: 0,
            data: this.props.freeData,
            displayData: this.props.freeData,  // 用于存放显示在页面上的参数数据数组
            upControlLength: true,
            upHorControlLength: true,
            downControlLength: true,
            downHorControlLength: true,
            headControl: true,
            isFirst: true,
            overallEvaluation: [],
            displayOverallEvaluation: [],
            guidance: [],
            displayGuidance : [],
            limitData: this.props.LimitSet,
            leftOrRight: "双耙"
        };
    }

    setShipParams = (index, e, type, str) => {
        console.log("自由模拟");
        console.log(index);
        // debugger
        this.props.changeProce();
        let items = this.state.data;
        if (e !== null) {
            // let temp = e.target === undefined ? e[e.reName] : e.target.value;
            let temp = e.target.value;
            let valLength = temp.length;
            let valLast = temp[temp.length - 1];
            let keyVal = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "-", undefined];
            if(keyVal.includes(valLast)) {
                let flag = false;
                // 第一个数为0， 第二个必须为小数点
                if((valLength == 2 && temp[0] == "0" && temp[1] != ".")) {
                    flag = true;
                };
                // 负号只能出现再最前面
                if(valLast == "-" && valLength > 1) {
                    flag = true;
                };
                // 只允许出现一次小数点
                if(valLast == "." && temp.split(".").length >= 3) {
                    flag = true;
                };
                // 小数点后限制两位数
                if(temp.split(".").length > 1 && temp.split(".")[1].length > 2) {
                    flag = true;
                }
                if(flag) return;
            } else {
                return;
            }
            if (this.state.upControlLength && (index === 1 || index === 3)) {
                let attrName = str.split(',');
                let tempL = attrName[0];
                let tempR = attrName[1];
                items.forEach(item => {
                    if (item.hasOwnProperty(tempL)) {
                        item[tempL] = temp;
                    } else if (item.hasOwnProperty(tempR)) {
                        item[tempR] = temp;
                    }
                });
            } else if (this.state.upHorControlLength && (index === 4 || index === 6)) {
                let attrName = str.split(',');
                let tempL = attrName[0];
                let tempR = attrName[1];
                items.forEach(item => {
                    if (item.hasOwnProperty(tempL)) {
                        item[tempL] = temp;
                    } else if (item.hasOwnProperty(tempR)) {
                        item[tempR] = temp;
                    }
                });
            } else if (this.state.downControlLength && (index === 7 || index === 9)) {
                let attrName = str.split(',');
                let tempL = attrName[0];
                let tempR = attrName[1];
                items.forEach(item => {
                    if (item.hasOwnProperty(tempL)) {
                        item[tempL] = temp;
                    } else if (item.hasOwnProperty(tempR)) {
                        item[tempR] = temp;
                    }
                });
            } else if (this.state.downHorControlLength && (index === 10 || index === 12)) {
                let attrName = str.split(',');
                let tempL = attrName[0];
                let tempR = attrName[1];
                items.forEach(item => {
                    if (item.hasOwnProperty(tempL)) {
                        item[tempL] = temp;
                    } else if (item.hasOwnProperty(tempR)) {
                        item[tempR] = temp;
                    }
                });
            } else if ((index === 13 || index === 15) && this.state.headControl) {
                items[12]['leftRunAngle'] = temp;
                items[14]['rightRunAngle'] = temp;
            } else {
                let attrName = str.split(',');
                let tempL = attrName[0];
                items.forEach(item => {
                    if (item.hasOwnProperty(tempL)) {
                        item[tempL] = temp;
                    }
                });
                this.setState({
                    data: items
                })
                // console.log("index",index)
                switch (index) {
                    case 10:
                        items[9]['leftDragDownHorAngle'] = temp;
                        break;
                    case 12:
                        items[11]['rightDragDownHorAngle'] = temp;
                        break;
                    case 13:
                        items[12]['leftRunAngle'] = temp;
                        break;
                    case 15:
                        items[14]['rightRunAngle'] = temp;
                        break;
                    default:
                }
            }
        } else if (type === 'reduce') {
            if ((index === 1 || index === 3) && this.state.upControlLength) {
                items[0]['leftDragUpAngle'] = items[0]['leftDragUpAngle'].toString().includes(".") ? (+items[0]['leftDragUpAngle'] - 1).toFixed(2) : +items[0]['leftDragUpAngle'] - 1;
                items[2]['rightDragUpAngle'] = items[2]['rightDragUpAngle'].toString().includes(".") ? (+items[2]['rightDragUpAngle'] - 1).toFixed(2) : +items[2]['rightDragUpAngle'] - 1;
            } else if (this.state.upHorControlLength && (index === 4 || index === 6)) {
                items[3]['leftDragUpHorAngle'] = items[3]['leftDragUpHorAngle'].toString().includes(".") ? (+items[3]['leftDragUpHorAngle'] - 1).toFixed(2) : +items[3]['leftDragUpHorAngle'] - 1;
                items[5]['rightDragUpHorAngle'] = items[5]['rightDragUpHorAngle'].toString().includes(".") ? (+items[5]['rightDragUpHorAngle'] - 1).toFixed(2) : +items[5]['rightDragUpHorAngle'] - 1;
            } else if ((index === 7 || index === 9) && this.state.downControlLength) {
                items[6]['leftDragDownAngle'] = items[6]['leftDragDownAngle'].toString().includes(".") ? (+items[6]['leftDragDownAngle'] - 1).toFixed(2) : +items[6]['leftDragDownAngle'] - 1;
                items[8]['rightDragDownAngle'] = items[8]['rightDragDownAngle'].toString().includes(".") ? (+items[8]['rightDragDownAngle'] - 1).toFixed(2) : +items[8]['rightDragDownAngle'] - 1;
            } else if ((index === 10 || index === 12) && this.state.downHorControlLength) {
                items[9]['leftDragDownHorAngle'] = items[9]['leftDragDownHorAngle'].toString().includes(".") ? (+items[9]['leftDragDownHorAngle'] - 1).toFixed(2) : +items[9]['leftDragDownHorAngle'] - 1;
                items[11]['rightDragDownHorAngle'] = items[11]['rightDragDownHorAngle'].toString().includes(".") ? (+items[11]['rightDragDownHorAngle'] - 1).toFixed(2) : +items[11]['rightDragDownHorAngle'] - 1;
            } else if ((index === 13 || index === 15) && this.state.headControl) {
                items[12]['leftRunAngle'] = items[12]['leftRunAngle'].toString().includes(".") ? (+items[12]['leftRunAngle'] - 1).toFixed(2) : +items[12]['leftRunAngle'] - 1;
                items[14]['rightRunAngle'] = items[14]['rightRunAngle'].toString().includes(".") ? (+items[14]['rightRunAngle'] - 1).toFixed(2) : +items[14]['rightRunAngle'] - 1;
            } else {
                switch (index) {
                    case 1:
                        items[0]['leftDragUpAngle'] = items[0]['leftDragUpAngle'].toString().includes(".") ? (+items[0]['leftDragUpAngle'] - 1).toFixed(2) : +items[0]['leftDragUpAngle'] - 1;
                        break;
                    case 3:
                        items[2]['rightDragUpAngle'] = items[2]['rightDragUpAngle'].toString().includes(".") ? (+items[2]['rightDragUpAngle'] - 1).toFixed(2) : +items[2]['rightDragUpAngle'] - 1;
                        break;
                    case 4:
                        items[3]['leftDragUpHorAngle'] = items[3]['leftDragUpHorAngle'].toString().includes(".") ? (+items[3]['leftDragUpHorAngle'] - 1).toFixed(2) : +items[3]['leftDragUpHorAngle'] - 1;
                        break;
                    case 6:
                        items[5]['rightDragUpHorAngle'] = items[5]['rightDragUpHorAngle'].toString().includes(".") ? (+items[5]['rightDragUpHorAngle'] - 1).toFixed(2) : +items[5]['rightDragUpHorAngle'] - 1;
                        break;
                    case 7:
                        items[6]['leftDragDownAngle'] = items[6]['leftDragDownAngle'].toString().includes(".") ? (+items[6]['leftDragDownAngle'] - 1).toFixed(2) : +items[6]['leftDragDownAngle'] - 1;
                        break;
                    case 9:
                        items[8]['rightDragDownAngle'] = items[8]['rightDragDownAngle'].toString().includes(".") ? (+items[8]['rightDragDownAngle'] - 1).toFixed(2) : +items[8]['rightDragDownAngle'] - 1;
                        break;
                    case 10:
                        items[9]['leftDragDownHorAngle'] = items[9]['leftDragDownHorAngle'].toString().includes(".") ? (+items[9]['leftDragDownHorAngle'] - 1).toFixed(2) : +items[9]['leftDragDownHorAngle'] - 1;
                        break;
                    case 12:
                        items[11]['rightDragDownHorAngle'] = (+items[11]['rightDragDownHorAngle'] - 1).toFixed(2);
                        break;
                    case 13:
                        items[12]['leftRunAngle'] = (+items[12]['leftRunAngle'] - 1).toFixed(2);
                        break;
                    case 15:
                        items[14]['rightRunAngle'] = (+items[14]['rightRunAngle'] - 1).toFixed(2);
                        break;
                    default:
                }
            }
        } else if (type === 'add') {
            if ((index === 1 || index === 3) && this.state.upControlLength) {
                let val = (+items[0]['leftDragUpAngle'] + 1).toString();
                if(val.includes(".")) {
                    items[0]['leftDragUpAngle'] = (+items[0]['leftDragUpAngle'] + 1).toFixed(2);
                    items[2]['rightDragUpAngle'] = (+items[2]['rightDragUpAngle'] + 1).toFixed(2);
                } else {
                    items[0]['leftDragUpAngle'] = +items[0]['leftDragUpAngle'] + 1;
                    items[2]['rightDragUpAngle'] = +items[2]['rightDragUpAngle'] + 1;
                }
            } else if (this.state.upHorControlLength && (index === 4 || index === 6)) {
                let val = (+items[3]['leftDragUpHorAngle'] + 1).toString();
                if(val.includes(".")) {
                    items[3]['leftDragUpHorAngle'] = (+items[3]['leftDragUpHorAngle'] + 1).toFixed(2);
                    items[5]['rightDragUpHorAngle'] = (+items[5]['rightDragUpHorAngle'] + 1).toFixed(2);
                } else {
                    items[3]['leftDragUpHorAngle'] = +items[3]['leftDragUpHorAngle'] + 1;
                    items[5]['rightDragUpHorAngle'] = +items[5]['rightDragUpHorAngle'] + 1;
                }
            } else if ((index === 7 || index === 9) && this.state.downControlLength) {
                let val = (+items[6]['leftDragDownAngle'] + 1).toString();
                if(val.includes(".")) {
                    items[6]['leftDragDownAngle'] = (+items[6]['leftDragDownAngle'] + 1).toFixed(2);
                    items[8]['rightDragDownAngle'] = (+items[8]['rightDragDownAngle'] + 1).toFixed(2);
                } else {
                    items[6]['leftDragDownAngle'] = (+items[6]['leftDragDownAngle'] + 1);
                    items[8]['rightDragDownAngle'] = (+items[8]['rightDragDownAngle'] + 1);
                }
            } else if ((index === 10 || index === 12) && this.state.downHorControlLength) {
                let val = (+items[9]['leftDragDownHorAngle'] + 1).toString();
                if(val.includes(".")) {
                    items[9]['leftDragDownHorAngle'] = (+items[9]['leftDragDownHorAngle'] + 1).toFixed(2);
                    items[11]['rightDragDownHorAngle'] = (+items[11]['rightDragDownHorAngle'] + 1).toFixed(2);
                } else {
                    items[9]['leftDragDownHorAngle'] = (+items[9]['leftDragDownHorAngle'] + 1);
                    items[11]['rightDragDownHorAngle'] = (+items[11]['rightDragDownHorAngle'] + 1);
                }
            } else if ((index === 13 || index === 15) && this.state.headControl) {
                let val = (Number(items[12]['leftRunAngle']) + 1).toString();
                if(val.includes(".")) {
                    items[12]['leftRunAngle'] = (Number(items[12]['leftRunAngle']) + 1).toFixed(2);
                    items[14]['rightRunAngle'] = (Number(items[14]['rightRunAngle']) + 1).toFixed(2);
                } else {
                    items[12]['leftRunAngle'] = (Number(items[12]['leftRunAngle']) + 1);
                    items[14]['rightRunAngle'] = (Number(items[14]['rightRunAngle']) + 1);
                };
            } else {
                switch (index) {
                    case 1:
                        if(items[0]['leftDragUpAngle'].toString().includes(".")) {
                            items[0]['leftDragUpAngle'] = (+items[0]['leftDragUpAngle'] + 1).toFixed(2);
                        } else {
                            items[0]['leftDragUpAngle'] = (+items[0]['leftDragUpAngle'] + 1);
                        }
                        break;
                    case 3:
                        if(items[2]['rightDragUpAngle'].toString().includes(".")) {
                            items[2]['rightDragUpAngle'] = (+items[2]['rightDragUpAngle'] + 1).toFixed(2);
                        } else {
                            items[2]['rightDragUpAngle'] = (+items[2]['rightDragUpAngle'] + 1);
                        }
                        break;
                    case 4:
                        if(items[3]['leftDragUpHorAngle'].toString().includes(".")) {
                            items[3]['leftDragUpHorAngle'] = (+items[3]['leftDragUpHorAngle'] + 1).toFixed(2);
                        } else {
                            items[3]['leftDragUpHorAngle'] = +items[3]['leftDragUpHorAngle'] + 1;
                        }
                        break;
                    case 6:
                       if(+items[5]['rightDragUpHorAngle'].toString().includes(".")) {
                        items[5]['rightDragUpHorAngle'] = (+items[5]['rightDragUpHorAngle'] + 1).toFixed(2);
                       } else {
                        items[5]['rightDragUpHorAngle'] = (+items[5]['rightDragUpHorAngle'] + 1);
                       }
                        break;
                    case 7:
                        if(+items[6]['leftDragDownAngle'].toString().includes(".")) {
                            items[6]['leftDragDownAngle'] = (+items[6]['leftDragDownAngle'] + 1).toFixed(2);
                        } else {
                            items[6]['leftDragDownAngle'] = (+items[6]['leftDragDownAngle'] + 1);
                        }
                        break;
                    case 9:
                        if(items[8]['rightDragDownAngle'].toString().includes(".")) {
                            items[8]['rightDragDownAngle'] = (+items[8]['rightDragDownAngle'] + 1).toFixed(2);
                        } else {
                            items[8]['rightDragDownAngle'] = (+items[8]['rightDragDownAngle'] + 1).toFixed(2);
                        }
                        break;
                    case 10:
                        if(items[9]['leftDragDownHorAngle'].toString().includes(".")) {
                            items[9]['leftDragDownHorAngle'] = (+items[9]['leftDragDownHorAngle'] + 1).toFixed(2);
                        } else {
                            items[9]['leftDragDownHorAngle'] = +items[9]['leftDragDownHorAngle'] + 1;
                        }
                        break;
                    case 12:
                        if(items[11]['rightDragDownHorAngle'].toString(".").includes(".")) {
                            items[11]['rightDragDownHorAngle'] = (+items[11]['rightDragDownHorAngle'] + 1).toFixed(2);
                        } else {
                            items[11]['rightDragDownHorAngle'] = +items[11]['rightDragDownHorAngle'] + 1;
                        }
                        break;
                    case 13:
                        if(items[12]['leftRunAngle'].toString().includes(".")) {
                            items[12]['leftRunAngle'] = (Number(items[12]['leftRunAngle']) + 1).toFixed(2);
                        } else {
                            items[12]['leftRunAngle'] = Number(items[12]['leftRunAngle']) + 1;
                        }
                        break;
                    case 15:
                        if(items[14]['rightRunAngle'].toString().includes(".")) {
                            items[14]['rightRunAngle'] = (Number(items[14]['rightRunAngle']) + 1).toFixed(2);
                        } else {
                            items[14]['rightRunAngle'] = Number(items[14]['rightRunAngle']) + 1;
                        }
                        break;
                    default:
                }
            }
        }
        store.dispatch({
            type: 'FREEDATA',
            data: items
        })
        this.setState({
            data: items
        }, () => {
            this.getOverallEvaluation();
            this.setShipInfo();
            runRank(items)
        })
    }
    /**
     * 控制是否关联
     * @param {*} type 关联id
     */
    lengthControl = (type) => {
        if (type === 'up') {
            this.setState({
                upControlLength: !this.state.upControlLength
            })
        } else if (type === 'upHor') {
            this.setState({
                upHorControlLength: !this.state.upHorControlLength
            })
        } else if (type === 'downHor') {
            this.setState({
                downHorControlLength: !this.state.downHorControlLength
            })
        } else if (type === 'down') {
            this.setState({
                downControlLength: !this.state.downControlLength
            })
        } else if (type === 'downhead') {
            this.setState({
                headControl: !this.state.headControl
            })
        }
    }

    setShipInfo() {
        console.log(this.props.freeData)
    }

    getOverallEvaluation() {
        let limitData = this.state.limitData;
        let items = this.state.data;
        console.log(items);
        console.log(this.state.displayData)
        let arr = [];
        arr.push({id: 1, name: '耙臂角度/最佳角度【范围】', child: []})
        arr[0].child.push({
            id: 1,
            title: '上耙管',
            key: '左',
            vert: items[0]['leftDragUpAngle'],
            verGood: limitData[0].good,
            verMin: limitData[0].min,
            verMax: limitData[0].max,
            onlyField: 1
            // hor: items[3]['leftDragUpHorAngle'],
            // horGood: limitData[1].good,
            // horMin: limitData[1].min,
            // horMax: limitData[1].max
        })
        arr[0].child.push({
            id: 2,
            title: '上耙管',
            key: '右',
            vert: items[2]['rightDragUpAngle'],
            verGood: limitData[0].good,
            verMin: limitData[0].min,
            verMax: limitData[0].max,
            onlyField: 1
            // hor: items[5]['rightDragUpHorAngle'],
            // horGood: limitData[1].good,
            // horMin: limitData[1].min,
            // horMax: limitData[1].max
        })
        arr[0].child.push({
            id: 3,
            title: '下耙管',
            key: '左',
            vert: items[6]['leftDragDownAngle'],
            verGood: limitData[2].good,
            verMin: limitData[2].min,
            verMax: limitData[2].max,
            onlyField: 1
            // hor: items[9]['leftDragDownHorAngle'],
            // horGood: limitData[3].good,
            // horMin: limitData[3].min,
            // horMax: limitData[3].max
        })
        arr[0].child.push({
            id: 4,
            title: '下耙管',
            key: '右',
            vert: items[8]['rightDragDownAngle'],
            verGood: limitData[2].good,
            verMin: limitData[2].min,
            verMax: limitData[2].max,
            onlyField: 1
            // hor: items[11]['rightDragDownHorAngle'],
            // horGood: limitData[3].good,
            // horMin: limitData[3].min,
            // horMax: limitData[3].max
        })
        // arr.push({id: 2, name: '耙头活动罩角度/最佳角度【范围】', child: []})
        arr.push({id: 2, name: '耙管安全夹角/最佳角度【范围】', child: []});
        let left = ((+items[0]['leftDragUpAngle']) == 0 && (+items[6]['leftDragDownAngle']) == 0) ? 0 : 180 -(+items[0]['leftDragUpAngle']) + (+items[6]['leftDragDownAngle']);
        arr[1].child.push({
            id: 1,
            title: '耙管',
            key: '左',
            vert: Number(left) ? left : 0,
            verGood: limitData[5].good,
            verMin: limitData[5].min,
            verMax: limitData[5].max,
            onlyField: 2
        });
        let right = ((+items[2]['rightDragUpAngle']) == 0 && (+items[8]['rightDragDownAngle']) == 0)? 0 : 180 - (+items[2]['rightDragUpAngle']) + (+items[8]['rightDragDownAngle']);
        arr[1].child.push({
            id: 2,
            title: '耙管',
            key: '右',
            vert: Number(right) ? right : 0,
            verGood: limitData[5].good,
            verMin: limitData[5].min,
            verMax: limitData[5].max,
            onlyField: 2
        })
        // arr[1].child.push({
        //     id: 1,
        //     title: '下耙管',
        //     key: '左',
        //     vert: items[6]['leftDragDownAngle'] - items[12]['leftRunAngle'],
        //     verGood: limitData[2].good - limitData[4].good,
        //     verMin: limitData[2].min - limitData[4].min,
        //     verMax: limitData[2].max - limitData[4].max
        // })
        // arr[1].child.push({
        //     id: 3,
        //     title: '下耙管',
        //     key: '右',
        //     vert: items[8]['rightDragDownAngle'] - items[14]['rightRunAngle'],
        //     verGood: limitData[2].good - limitData[4].good,
        //     verMin: limitData[2].min - limitData[4].min,
        //     verMax: limitData[2].max - limitData[4].max
        // })
        console.log(this.state.leftOrRight)
        let copyArr = JSON.parse(JSON.stringify(arr));
        let appraise = [];
        if(this.state.leftOrRight == "左耙" || this.state.leftOrRight == "右耙") {
            console.log(copyArr);
            copyArr.forEach(item => {
                // console.log(item);
                let itemObj = [];
                item["child"].forEach(childrenItem => {
                    if((this.state.leftOrRight).indexOf(childrenItem.key) >= 0){
                        itemObj.push(childrenItem);
                    }
                });
                item.child = itemObj;
                appraise.push(item);
            });
            console.log(appraise);
        } else {
            appraise = arr
        }
        this.setState({
                overallEvaluation: arr,
                displayOverallEvaluation: appraise
            },
            () => {
                this.getGuidance()
                this.setShipInfo()
            })
    }

    getGuidance() {
        let temp = JSON.parse(JSON.stringify(this.state.overallEvaluation));
        console.log(temp);
        let allNice = true;
        for (let i = 0; i < temp.length; i++) {
            let oneNice = true;
            let twoNice = true;
            let which = true;
            for (let j = 0; j < temp[i].child.length; j++) {
                if (temp[i].child[j].hor !== undefined) {
                    if (temp[i].child[j].vert >= temp[i].child[j].verMin && temp[i].child[j].vert <= temp[i].child[j].verMax) {
                        temp[i].child[j]['verNice'] = true;
                    } else {
                        allNice = false;
                        oneNice = false;
                        temp[i].child[j]['verNice'] = false;
                    }
                    if (temp[i].child[j].hor >= temp[i].child[j].horMin && temp[i].child[j].hor <= temp[i].child[j].horMax) {
                        temp[i].child[j]['horNice'] = true;
                    } else {
                        allNice = false;
                        oneNice = false;
                        temp[i].child[j]['horNice'] = false;
                    }
                } else {
                    which = false;
                    if (temp[i].child[j].vert >= temp[i].child[j].verMin && temp[i].child[j].vert <= temp[i].child[j].verMax) {
                        temp[i].child[j]['verNice'] = true;
                    } else {
                        allNice = false;
                        twoNice = false;
                        temp[i].child[j]['verNice'] = false;
                    }
                }
            }
            temp[i]['twoNice'] = twoNice;
            temp[i]['oneNice'] = oneNice;
            temp[i]['which'] = which;
            // temp[i]['oneNice'] = true;
            // temp[i]['twoNice'] = false
            // temp[i]['which'] = true;

        }
        console.log(temp);
        let copyTemp = JSON.parse(JSON.stringify(temp));
        let instruction = [];
        if(this.state.leftOrRight == "左耙" || this.state.leftOrRight == "右耙") {
            copyTemp.forEach(item => {
                let itemObj = [];
                item["child"].forEach(childrenItem => {
                    if((this.state.leftOrRight).indexOf(childrenItem.key) >= 0){
                        itemObj.push(childrenItem);
                    }
                });
                item.child = itemObj;
                instruction.push(item);
            });
        } else {
            instruction = temp
        }
        if (allNice) {
            this.setState({
                guidance: []
            })
        } else {
            this.setState({
                guidance: temp,
                displayGuidance: instruction
            })
        }
    }

    componentDidMount() {
        this.getOverallEvaluation()
    }

    changeDisplayStatue(e, data, overallEvaluation, guidance) {
        console.log(data);
        console.log(overallEvaluation);
        let type = e.target.value;
        if (type === '左耙' || type === '右耙') {
            let tempData = [];
            data.forEach(item => {
                // 当参数数组是值，而不是连接符时
                if (item.val !== undefined && item.val.indexOf(e.target.value) >= 0) tempData.push(item);
            });

            let appraise = [];
            let copyOverallEvaluation = JSON.parse(JSON.stringify(overallEvaluation))
            copyOverallEvaluation.forEach(item => {
                // console.log(item);
                let itemObj = [];
                item["child"].forEach(childrenItem => {
                    if((e.target.value).indexOf(childrenItem.key) >= 0){
                        itemObj.push(childrenItem);
                    }
                });
                item.child = itemObj;
                appraise.push(item);
            });
       
            let instruction = [];
            let copyGuidance = JSON.parse(JSON.stringify(guidance));
            copyGuidance.forEach(item => {
                console.log(item);
                let itemObj = [];
                item["child"].forEach(childrenItem => {
                    if((e.target.value).indexOf(childrenItem.key) >= 0){
                        itemObj.push(childrenItem);
                    }
                });
                item.child = itemObj;
                instruction.push(item);
            });

            console.log(instruction);
            let leftOrRight = type == '左耙' ? "左耙" : "右耙";
            this.setState({
                displayData: tempData,
                upControlLength: false,
                upHorControlLength: false,
                downControlLength: false,
                downHorControlLength: false,
                headControl: false,
                displayOverallEvaluation: appraise,
                displayGuidance: instruction,
                leftOrRight: leftOrRight
            })
        } else if (type === '双耙') {
            this.setState({
                displayData: data,
                upControlLength: true,
                upHorControlLength: true,
                downControlLength: true,
                downHorControlLength: true,
                headControl: true,
                displayOverallEvaluation: overallEvaluation,
                displayGuidance: guidance,
                leftOrRight: "双耙"
            })
        }
    }

    render() {
        const {data, displayData, overallEvaluation, guidance, limitData} = this.state;
        console.log(limitData);
        console.log(this.state.displayGuidance);
        console.log(this.state);
        
        return (
            <div>
                <p>参数输入</p>
                <select name="3"
                        id="statusSelect"
                        ref="changeVal"
                        onChange={(e) => this.changeDisplayStatue(e, data, overallEvaluation, guidance)}
                >
                    <option className='title-name' key='1'>双耙</option>
                    <option className='title-name' key='2'>左耙</option>
                    <option className='title-name' key='3'>右耙</option>
                </select>
                <ul className="freeControlLink">
                    {
                        displayData.map((item, index) => (
                            item.link ? <li key={index} className='connect'>
                                    {
                                        item.reName === "up" ? <>{
                                            this.state.upControlLength === true ? <LinkOutlined onClick={() => {
                                                this.lengthControl('up')
                                            }}/> : <DisconnectOutlined onClick={() => {
                                                this.lengthControl('up')
                                            }}/>
                                        }</> : null
                                    }
                                    {
                                        item.reName === "down" ? <>{
                                            this.state.downControlLength === true ? <LinkOutlined onClick={() => {
                                                this.lengthControl('down')
                                            }}/> : <DisconnectOutlined onClick={() => {
                                                this.lengthControl('down')
                                            }}/>
                                        }</> : null
                                    }
                                    {
                                        item.reName === "upHor" ? <>{
                                            this.state.upHorControlLength === true ? <LinkOutlined onClick={() => {
                                                this.lengthControl('upHor')
                                            }}/> : <DisconnectOutlined onClick={() => {
                                                this.lengthControl('upHor')
                                            }}/>
                                        }</> : null
                                    }
                                    {
                                        item.reName === "downHor" ? <>{
                                            this.state.downHorControlLength === true ? <LinkOutlined onClick={() => {
                                                this.lengthControl('downHor')
                                            }}/> : <DisconnectOutlined onClick={() => {
                                                this.lengthControl('downHor')
                                            }}/>
                                        }</> : null
                                    }
                                    {
                                        item.reName === "downhead" ? <>{
                                            this.state.headControl === true ? <LinkOutlined onClick={() => {
                                                this.lengthControl('downhead')
                                            }}/> : <DisconnectOutlined onClick={() => {
                                                this.lengthControl('downhead')
                                            }}/>
                                        }</> : null
                                    }
                                </li> :
                                <li key={index}>
                                    <i></i>
                                    <span>{item.val}</span>
                                    <span className="degree">{item.unit}</span>
                                    <div className="editValue">
                                        <span
                                            onClick={(e) => this.setShipParams(item.id, null, 'reduce', item.attrName)}>-</span>
                                        <input type="text" value={item[item.reName]}
                                               onChange={(e) => this.setShipParams(item.id, e, null, item.attrName)}/>
                                        <span
                                            onClick={(e) => this.setShipParams(item.id, null, 'add', item.attrName)}>+</span>
                                    </div>
                                </li>
                        ))
                    }
                </ul>
                <p>总体评价</p>
                <div className="comment">
                    <ul>
                        {
                            this.state.displayOverallEvaluation.map((item, index) => (
                                <li key={index}>
                                    {item.id}、{item.name}
                                    {
                                        item.child.map((ite, id) => (
                                            <ul key={id}>
                                                <li>
                                                    <p>{ite.key}&nbsp;{ite.title}</p>
                                                    <div className="comment_item_ang">
                                                        <div>
                                                            {
                                                                ite.onlyField == 1 ? <span>垂直角度:{ite.vert}</span> : null
                                                            }
                                                            {
                                                               ite.onlyField == 2 ? <span>安全夹角:{ite.vert}</span> : null
                                                            }
                                                            <span>最佳值:{ite.verGood}</span>
                                                            <span>范围:[{ite.verMin}-{ite.verMax}]</span>
                                                        </div>
                                                        {
                                                            ite.hor === undefined ? null : <div>
                                                                <span>水平角度:{ite.hor}</span>
                                                                <span>最佳值:{ite.horGood}</span>
                                                                <span>范围:[{ite.horMin}-{ite.horMax}]</span>
                                                            </div>
                                                        }

                                                    </div>
                                                </li>
                                            </ul>
                                        ))
                                    }
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <p>指导意见</p>
                <div className="comment">
                    <ul>
                        {
                            this.state.displayGuidance.length === 0 ?
                                <>
                                    <p style={{'textAlign': 'center'}}>均在合理范围内</p>
                                </> :
                                this.state.displayGuidance.map((item, index) => (
                                    <li key={item.id}>
                                        {item.id}、{item.name}
                                        {
                                            item.which ?
                                                <>
                                                    {
                                                        item.oneNice ? <>
                                                                <p style={{'textAlign': 'center'}}>在合理范围内</p>
                                                            </> :
                                                            item.child.map((ite, id) => (
                                                                <>
                                                                    {
                                                                        ite.verNice ? null : <ul key={ite.id}>
                                                                            <li>
                                                                                <>
                                                                                {
                                                                                 ite.onlyField === 1 ?  <p>{ite.key}{ite.title}角度为{ite.vert},不在[{ite.verMin}-{ite.verMax}]范围内，需调整</p> : null
                                                                                }
                                                                                {
                                                                                 ite.onlyField === 2 ?  <p>{ite.key}{ite.title}安全夹角为{ite.vert},不在[{ite.verMin}-{ite.verMax}]范围内，需调整</p> : null
                                                                                }
                                                                                </>
                                                                            </li>
                                                                        </ul>

                                                                    }

                                                                    {
                                                                        ite.horNice ? null : <>
                                                                            <ul key={ite.id}>
                                                                                <li>
                                                                                    <p>{ite.key}{ite.title}水平角度为{ite.hor},不在[{ite.horMin}-{ite.horMax}]范围内,需调整</p>
                                                                                </li>
                                                                            </ul>
                                                                        </>
                                                                    }
                                                                </>
                                                            ))
                                                    }
                                                </> : <>
                                                    {
                                                        item.twoNice ? <>
                                                                <p style={{'textAlign': 'center'}}>在合理范围内</p>
                                                            </> :
                                                            item.child.map((ite, id) => (
                                                                <>
                                                                    {
                                                                        ite.verNice ? null : <ul key={ite.id}>
                                                                            <li>
                                                                                {
                                                                                 ite.onlyField === 1 ?  <p>{ite.key}{ite.title}角度为{ite.vert},不在[{ite.verMin}-{ite.verMax}]范围内，需调整</p> : null
                                                                                }
                                                                                {
                                                                                 ite.onlyField === 2 ?  <p>{ite.key}{ite.title}安全夹角为{ite.vert},不在[{ite.verMin}-{ite.verMax}]范围内，需调整</p> : null
                                                                                }
                                                                            </li>
                                                                        </ul>
                                                                    }
                                                                </>
                                                            ))
                                                    }
                                                </>
                                        }
                                    </li>
                                ))
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        freeData: state.freeData
    }
}

export default connect(mapStateToProps)(RightWinWrapFree);
