import React, { Component } from 'react';
import store from '../../../redux/store';
import ToolCol1 from '../../components/shipAction/ToolCol1';
import ToolCol2 from '../../components/shipAction/ToolCol2';
import ToolCol3 from '../../components/shipAction/ToolCol3';
import RightWinWrapFree from '../../components/monitor/RightWinWrapFree';
import RightWinWrapOutput from '../../components/monitor/RightWinWrapOutput';
import RightWinWrapPairUp from '../../components/monitor/RightWinWrapPairUp';
import LimitSet from '../../components/monitor/LimitSet'
import { connect } from 'react-redux';
import {
    changeDepth, //移除河床
    changeSolumData, //更新水深文件
} from '../3d/scene';
import { Button, Select } from 'antd';

import { LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import { changTubeLenght } from '../3d/ship';
import Object3d from '../3d';
import { lineScaleRotation } from '../3d/ship/robotic-arm';
import './index.less';
import { userInfo } from '../requestParent';
const { Option } = Select;

// 系统参数
class SystemParams extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            isClose: 0,
            data: this.props.data,
            tempData: {
                leftElbowLen: 8,
                rightElbowLen: 8,
                leftHeadLen: 9,
                rightHeadLen: 9,
                leftPosition: 10,
                rightPosition: 10,
                leftPipeDiameter: 0,
                rightPipeDiameter: 0,
                waveCompensator: 0
            },
            upControlLength: true,
            downControlLength: true,
            elbowLenCtrl: false,
            headLenCtrl: false,
            positionCtrl: false,
            PipeDiameterCrtl: false
            // elbowLenCtrl: true,
            // headLenCtrl: true,
            // positionCtrl: true,
            // PipeDiameterCrtl: true
        };
    }
    //切换地质文件入口
    changeSolumFile(e) {
        for (let i = 0; i < this.props.solumFileName.length; i++) {
            if (this.props.solumFileName[i].name === e.target.value) {
                store.dispatch({
                    type: 'SET_LOADING',
                    data: true,
                });
                store.dispatch({
                    type: 'SET_LOADINGWORD',
                    data: "水深加载中",
                });
                changeDepth();//移除河床
                changeSolumData({
                    method: 'GetSolumData',
                    solum_file_name: this.props.solumFileName[i].real_name
                })
            }
        }
    }
    changeControlStyle(e) {
        if (e.target.value === '自由模拟') {
            userInfo.userSelfControl = true;
        } else {
            userInfo.userSelfControl = false;
        }
    }
    setShipParams = (index, e, type, str) => {
        console.log(index);
        // let items = JSON.parse(JSON.stringify(this.state.data));
        // console.log(items);
        let items = this.state.data;
        if (1 <= index <= 13) {
            lineScaleRotation('左', '1')
            lineScaleRotation('左', '2')
            lineScaleRotation('右', '1')
            lineScaleRotation('右', '2')
            if (this.state.upControlLength && (index === 1 || index === 3)) {
                let attrName = str.split(',');
                let tempL = attrName[0];
                let tempR = attrName[1];
                if (e !== null) {
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
                    };
                    items.forEach(item => {
                        if (item.hasOwnProperty(tempL)) {
                            item[tempL] = e.target.value;
                        } else if (item.hasOwnProperty(tempR)) {
                            item[tempR] = e.target.value
                        }
                    });
                    this.setState({
                        data: items
                    })
                    if (Number(e.target.value) !== '-' && Number(e.target.value) >= 0) {
                        changTubeLenght('左', '上', Number(e.target.value), 'input');
                        changTubeLenght('右', '上', Number(e.target.value), 'input');
                    }
                    let lengthObj = {
                        leftUpLength: items[0]['leftUpDragLength'],
                        rightUpLenght: items[2]['rightUpDragLength'],
                        leftDownLength: items[1]['leftDownDragLength'],
                        rightDownLength: items[3]['rightDownDragLength']
                    }
                    store.dispatch({
                        type: 'DRAGLENGTH',
                        data: lengthObj,
                    });
                } else if (type === 'reduce') {
                    items.forEach(item => {
                        if (item.hasOwnProperty(tempL)) {
                            let val = this.state.data[0][tempL]
                            item[tempL] = val.toString().includes(".") ? (+val - 1).toFixed(2) : +val - 1;
                        } else if (item.hasOwnProperty(tempR)) {
                            console.log(tempR)
                            let val = this.state.data[2][tempR];
                            item[tempR] = val.toString().includes(".") ? (+val - 1).toFixed(2) : +val - 1;
                        }
                    });
                    this.setState({
                        data: items
                    })
                    changTubeLenght('左', '上', (+this.state.data[0][tempL] - 1), 'reduce');
                    changTubeLenght('右', '上', (+this.state.data[2][tempR] - 1), 'reduce');
                } else {
                    let val = null;
                    items.forEach(item => {
                        if (item.hasOwnProperty(tempL)) {
                            val = this.state.data[0][tempL];
                            item[tempL] = val.toString().includes(".") ? (+val + 1).toFixed(2) : +val + 1;
                        } else if (item.hasOwnProperty(tempR)) {
                            val = this.state.data[2][tempR]
                            item[tempR] = val.toString().includes(".") ? (+val + 1).toFixed(2) : +val + 1;
                        }
                    });
                    this.setState({
                        data: items
                    })
                    changTubeLenght('左', '上', (+this.state.data[0][tempL] + 1), 'add');
                    changTubeLenght('右', '上', (+this.state.data[2][tempR] + 1), 'add');
                }
            } else if (this.state.downControlLength && (index === 2 || index === 4)) {
                let attrName = str.split(',');
                let tempL = attrName[0];
                let tempR = attrName[1];
                if (e !== null) {
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
                    };
                    items.forEach(item => {
                        if (item.hasOwnProperty(tempL)) {
                            item[tempL] = e.target.value;
                        } else if (item.hasOwnProperty(tempR)) {
                            item[tempR] = e.target.value;
                        }
                    });
                    this.setState({
                        data: items
                    })
                    if (Number(e.target.value) !== '-' && Number(e.target.value) >= 0) {
                        changTubeLenght('左', '下', Number(e.target.value), 'input');
                        changTubeLenght('右', '下', Number(e.target.value), 'input');
                    }
                    let lengthObj = {
                        leftUpLength: items[0]['leftUpDragLength'],
                        rightUpLenght: items[2]['rightUpDragLength'],
                        leftDownLength: items[1]['leftDownDragLength'],
                        rightDownLength: items[3]['rightDownDragLength']
                    }
                    store.dispatch({
                        type: 'DRAGLENGTH',
                        data: lengthObj,
                    });
                } else if (type === 'reduce') {
                    let val = null;
                    items.forEach(item => {
                        if (item.hasOwnProperty(tempL)) {
                            val = this.state.data[1][tempL]
                            item[tempL] = val.toString().includes(".") ? (+val - 1).toFixed(2) : +val - 1;
                        } else if (item.hasOwnProperty(tempR)) {
                            val = this.state.data[3][tempR];
                            item[tempR] = val.toString().includes(".") ? (+val - 1).toFixed(2) : +val - 1;
                        }
                    });
                    this.setState({
                        data: items
                    })
                    changTubeLenght('左', '下', this.state.data[1][tempL] - 1, 'reduce');
                    changTubeLenght('右', '下', this.state.data[3][tempR] - 1, 'reduce');
                } else {
                    items.forEach(item => {
                        let val = null;
                        if (item.hasOwnProperty(tempL)) {
                            val = this.state.data[1][tempL]
                            item[tempL] = val.toString().includes(".") ? (+val + 1).toFixed(2) : (+val) + 1;
                        } else if (item.hasOwnProperty(tempR)) {
                            val = this.state.data[3][tempR];
                            item[tempR] = val.toString().includes(".") ? (+val + 1).toFixed(2) : (+val) + 1;
                        }
                    });
                    this.setState({
                        data: items
                    })
                    changTubeLenght('左', '下', this.state.data[1][tempL] + 1, 'add');
                    changTubeLenght('右', '下', this.state.data[3][tempR] + 1, 'add');
                }
            } else if(index >=5 && index <=13) {
                debugger;
                let attrName = str;
                // console.log(attrName)
                // console.log(this.state.tempData)
                if (e !== null) {
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
                    };
                    let newObj = temp;
                    console.log(newObj)
                    let newData = Object.assign({}, this.state.tempData, {[attrName]:newObj})
                    console.log(newData)
                    this.setState({
                        tempData: newData
                    });
                    switch(index) {
                        case 7:
                            items[6]["tubeDensity"] = newObj;
                            this.setState({
                                data: items
                            });
                            break;
                        case 8:
                                items[7]["pressWightPer"] = newObj;
                                this.setState({
                                    data: items
                                });
                            break;
                        case 9:
                            items[8]["mudUpDistance"] = newObj;
                            console.log(items[8]["mudUpDistance"]);
                            console.log(newData);
                            this.setState({
                                data: items
                            });
                            break;
                        case 10:
                                items[9]["draftSetVal"] = newObj;
                                this.setState({
                                    data: items
                                });
                                break;
                        default:
                            break;
                    }
                }else if(type === 'reduce'){
                    let val = this.state.tempData[attrName];
                    let newObj = val.toString().includes(".") ? (+this.state.tempData[attrName] - 1).toFixed(2) : +this.state.tempData[attrName] - 1;
                    console.log(newObj)
                    let newData = Object.assign({}, this.state.tempData, {[attrName]:newObj})
                    console.log(newData)
                    this.setState({
                        tempData: newData
                    });
                    switch(index) {
                        case 7:
                            items[6]["tubeDensity"] = newObj;
                            this.setState({
                                data: items
                            });
                            break;
                        case 8:
                                items[7]["pressWightPer"] = newObj;
                                this.setState({
                                    data: items
                                });
                                break;
                        case 9:
                            items[8]["mudUpDistance"] = newObj;
                            console.log(items[8]["mudUpDistance"]);
                            console.log(newData);
                            this.setState({
                                data: items
                            });
                            break;
                            case 10:
                                items[9]["draftSetVal"] = newObj;
                                this.setState({
                                    data: items
                                });
                                break;
                        default:
                            break;
                    }
                } else if(type === 'add'){
                    let val = this.state.tempData[attrName];
                    let newObj = val.toString().includes(".") ? (+this.state.tempData[attrName] + 1).toFixed(2) : +this.state.tempData[attrName] + 1;
                    console.log(newObj)
                    let newData = Object.assign({}, this.state.tempData, {[attrName]:newObj})
                    console.log(newData)
                    this.setState({
                        tempData: newData
                    });
                    switch(index) {
                        case 7:
                            items[6]["tubeDensity"] = newObj;
                            this.setState({
                                data: items
                            });
                            break;
                        case 8:
                                items[7]["pressWightPer"] = newObj;
                                this.setState({
                                    data: items
                                });
                                break;
                        case 9:
                            items[8]["mudUpDistance"] = newObj;
                            console.log(items[8]["mudUpDistance"]);
                            console.log(newData);
                            this.setState({
                                data: items
                            });
                            break;
                        case 10:
                                items[9]["draftSetVal"] = newObj;
                                this.setState({
                                    data: items
                                });
                                break;
                        default:
                            break;
                    }
                }
            } else {
                let attrName = str.split(',');
                let temp0 = attrName[0];
                let temp1 = attrName[1];
                if (e !== null) {
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
                    };
                    items.forEach(item => {
                        if (index === 1 || index === 2) {
                            if (item.hasOwnProperty(temp0)) {
                                item[temp0] = e.target.value;
                            }
                        } else if (index === 3 || index === 4) {
                            if (item.hasOwnProperty(temp1)) {
                                item[temp1] = e.target.value;
                            }
                        }
                    });
                    this.setState({
                        data: items
                    })
                    if (Number(e.target.value) !== '-' && Number(e.target.value) !== '') {
                        if (index === 2) {
                            changTubeLenght('左', '下', Number(e.target.value), 'input');
                        } else if (index === 1) {
                            changTubeLenght('左', '上', Number(e.target.value), 'input');
                        } else if (index === 3) {
                            changTubeLenght('右', '上', Number(e.target.value), 'input');
                        } else if (index === 4) {
                            changTubeLenght('右', '下', Number(e.target.value), 'input');
                        }
                    }
                } else if (type === 'reduce') {
                    debugger;
                    let val = null;
                    items.forEach(item => {
                        if (index === 1 || index === 2) {
                            if (item.hasOwnProperty(temp0)) {
                                val = this.state.data[index - 1][temp0];
                                if(Number(val)) {
                                    item[temp0] = val.toString().includes(".") ?  (+val - 1).toFixed(2) : +val - 1;
                                } else {
                                    item[temp0] = -1;
                                }
                            }
                        } else if(index === 3 || index === 4) {
                            if (item.hasOwnProperty(temp1)) {
                                val = this.state.data[index - 1][temp1];
                                if (Number(val)) {
                                    item[temp1] = val.toString().includes(".") ?  (+val - 1).toFixed(2) : (+val) - 1;
                                } else {
                                    item[temp1] = -1;
                                }
                            }
                        }
                    });
                    this.setState({
                        data: items
                    });
                    if (index === 1) {
                        changTubeLenght('左', '上', (+this.state.data[index - 1][temp0] - 1), 'reduce');
                    } else if (index === 3) {
                        changTubeLenght('右', '上', (+this.state.data[index - 1][temp1] - 1), 'reduce');
                    } else if (index === 2) {
                        changTubeLenght('左', '下', (+this.state.data[index - 1][temp0] - 1), 'reduce');
                    } else if (index === 4) {
                        changTubeLenght('右', '下', (+this.state.data[index - 1][temp1] - 1), 'reduce');
                    }
                } else if (type === 'add') {
                    let val = null;
                    items.forEach(item => {
                        if (index === 1 || index === 2) {
                            if (item.hasOwnProperty(temp0)) {
                                val = this.state.data[index - 1][temp0];
                                if(Number(val)) {
                                    item[temp0] = val.toString().includes(".") ? (+val + 1).toFixed(2) : (+val) + 1;
                                } else {
                                    item[temp0] =  1;
                                }
                            }
                        } else if (index === 3 || index === 4) {
                            if (item.hasOwnProperty(temp1)) {
                                val = this.state.data[index - 1][temp1];
                                if(+val) {
                                    item[temp1] = val.toString().includes(".") ? (+val + 1).toFixed(2) : (+val) + 1;
                                } else {
                                    item[temp1] = 1;
                                }
                                    
                            }
                        }
                    });
                    this.setState({
                        data: items
                    })
                    if (index === 1) {
                        changTubeLenght('左', '上', (+this.state.data[index - 1][temp0] + 1), 'add');
                    } else if (index === 3) {
                        changTubeLenght('右', '上', (+this.state.data[index - 1][temp1] + 1), 'add');
                    } else if (index === 2) {
                        changTubeLenght('左', '下', (+this.state.data[index - 1][temp0] + 1), 'add');
                    } else if (index === 4) {
                        changTubeLenght('右', '下', (+this.state.data[index - 1][temp1] + 1), 'add');
                    }
                }
            }
        }
        store.dispatch({
            type: 'DRAGLENGTH',
            data: items
        })
    };

    lengthControl = (type) => {
        console.log(type);
        switch(type) {
            case "up":
                this.setState({
                    upControlLength: !this.state.upControlLength
                });
                break;
            case "down":
                this.setState({
                    downControlLength: !this.state.downControlLength
                });
                break;
            // case "elbow":
            //     this.setState({
            //         elbowLenCtrl: !this.state.elbowLenCtrl
            //     });
            //     break;
            // case "head":
            //     this.setState({
            //         headLenCtrl: !this.state.headLenCtrl
            //     });
            //     break;
            // case "pipe":
            //     this.setState({
            //         PipeDiameterCrtl: !this.state.PipeDiameterCrtl
            //     });
                // break;
            // case "position":
            //     this.setState({
            //         positionCtrl: !this.state.positionCtrl
            //     });
            //     break;
            default:
                break;
        }
        // if (type === 'up') {
        //     this.setState({
        //         upControlLength: !this.state.upControlLength
        //     })
        // } else {
        //     this.setState({
        //         downControlLength: !this.state.downControlLength
        //     })
        // }
    };

    render() {
        // let tempData = window.localStorage.getItem('SystemParams');
        var data = null;
        var tempData = null;
        // if(tempData){
        //     data = JSON.parse(tempData);
        // }else{
        data = this.state.data;
        tempData = this.state.tempData;
        // }
        // const { data } = this.state.data;
        const { solumFileName } = this.props;
        return (
            <div>
                <p>耙臂设置</p>
                <ul className="controlLink">
                    <li>
                        <i></i>
                        <span className="words">左耙上耙臂长度</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(1, null, 'reduce', "leftUpDragLength,rightUpDragLength")}>-</span>
                            <input type="text" value={data[0].leftUpDragLength} onChange={(e) => this.setShipParams(1, e, null, "leftUpDragLength,rightUpDragLength")} />
                            <span onClick={(e) => this.setShipParams(1, null, 'add', "leftUpDragLength,rightUpDragLength")}>+</span>
                        </div>
                    </li>
                    <li className='connect'>{this.state.upControlLength === true ? <LinkOutlined onClick={() => { this.lengthControl('up') }} /> : <DisconnectOutlined onClick={() => { this.lengthControl('up') }} />}</li>
                    <li>
                        <i></i>
                        <span className="words">右耙上耙臂长度</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(3, null, 'reduce', "leftUpDragLength,rightUpDragLength")}>-</span>
                            <input type="text" value={data[2].rightUpDragLength} onChange={(e) => this.setShipParams(3, e, null, "leftUpDragLength,rightUpDragLength")} />
                            <span onClick={(e) => this.setShipParams(3, null, 'add', "leftUpDragLength,rightUpDragLength")}>+</span>
                        </div>
                    </li>
                    <li>
                        <i></i>
                        <span className="words">左耙下耙臂长度</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(2, null, 'reduce', "leftDownDragLength,rightDownDragLength")}>-</span>
                            <input type="text" value={data[1].leftDownDragLength} onChange={(e) => this.setShipParams(2, e, null, "leftDownDragLength,rightDownDragLength")} />
                            <span onClick={(e) => this.setShipParams(2, null, 'add', "leftDownDragLength,rightDownDragLength")}>+</span>
                        </div>
                    </li>
                    <li  className='connect'>
                        {this.state.downControlLength === true ? <LinkOutlined onClick={() => { this.lengthControl('down') }} /> : <DisconnectOutlined onClick={() => { this.lengthControl('down') }} />}
                    </li>
                    <li>
                        <i></i>
                        <span className="words">右耙下耙臂长度</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(4, null, 'reduce', "leftDownDragLength,rightDownDragLength")}>-</span>
                            <input type="text" value={data[3].rightDownDragLength} onChange={(e) => this.setShipParams(4, e, null, "leftDownDragLength,rightDownDragLength")} />
                            <span onClick={(e) => this.setShipParams(4, null, 'add', "leftDownDragLength,rightDownDragLength")}>+</span>
                        </div>
                    </li>
                    <li>
                        <i></i>
                        <span className="words">左耙弯管长度</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(5, null, 'reduce', "leftElbowLen")}>-</span>
                            <input type="text" value={tempData.leftElbowLen} onChange={(e) => this.setShipParams(5, e, null, "leftElbowLen")} />
                            <span onClick={(e) => this.setShipParams(5, null, 'add', "leftElbowLen")}>+</span>
                        </div>
                    </li>
                    <li  className='connect'>
                        {this.state.elbowLenCtrl === true ? <LinkOutlined onClick={() => { this.lengthControl('elbow') }} /> : <DisconnectOutlined onClick={() => { this.lengthControl('elbow') }} />}
                    </li>
                    <li>
                        <i></i>
                        <span className="words">右耙弯管长度</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(6, null, 'reduce', "rightElbowLen")}>-</span>
                            <input type="text" value={tempData.rightElbowLen} onChange={(e) => this.setShipParams(6, e, null, "rightElbowLen")} />
                            <span onClick={(e) => this.setShipParams(6, null, 'add', "rightElbowLen")}>+</span>
                        </div>
                    </li>
                    <li>
                        <i></i>
                        <span className="words">左耙头高度</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(7, null, 'reduce', "leftHeadLen")}>-</span>
                            <input type="text" value={tempData.leftHeadLen} onChange={(e) => this.setShipParams(7, e, null, "leftHeadLen")} />
                            <span onClick={(e) => this.setShipParams(7, null, 'add', "leftHeadLen")}>+</span>
                        </div>
                    </li>
                    <li  className='connect'>
                        {this.state.headLenCtrl === true ? <LinkOutlined onClick={() => { this.lengthControl('head') }} /> : <DisconnectOutlined onClick={() => { this.lengthControl('head') }} />}
                    </li>
                    <li>
                        <i></i>
                        <span className="words">右耙头高度</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(8, null, 'reduce', "rightHeadLen")}>-</span>
                            <input type="text" value={tempData.rightHeadLen} onChange={(e) => this.setShipParams(8, e, null, "rightHeadLen")} />
                            <span onClick={(e) => this.setShipParams(8, null, 'add', "rightHeadLen")}>+</span>
                        </div>
                    </li>
                    <li>
                        <i></i>
                        <span className="words">左耙臂管径</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(11, null, 'reduce', "leftPipeDiameter")}>-</span>
                            <input type="text" value={tempData.leftPipeDiameter} onChange={(e) => this.setShipParams(11, e, null, "leftPipeDiameter")} />
                            <span onClick={(e) => this.setShipParams(11, null, 'add', "leftPipeDiameter")}>+</span>
                        </div>
                    </li>
                    <li className='connect'>{this.state.PipeDiameterCrtl === true ? <LinkOutlined onClick={() => { this.lengthControl('pipe') }} /> : <DisconnectOutlined onClick={() => { this.lengthControl('pipe') }} />}</li>
                    <li>
                        <i></i>
                        <span className="words">右耙臂管径</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(12, null, 'reduce', "rightPipeDiameter")}>-</span>
                            <input type="text" value={tempData.rightPipeDiameter} onChange={(e) => this.setShipParams(12, e, null, "rightPipeDiameter")} />
                            <span onClick={(e) => this.setShipParams(12, null, 'add', "rightPipeDiameter")}>+</span>
                        </div>
                    </li>
                </ul>
                <p>吸口安装位置</p>
                <ul className="controlLink">
                    <li>
                        <i></i>
                        <span className="words">左吸口安装位置</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(9, null, 'reduce', "leftPosition")}>-</span>
                            <input type="text" value={tempData.leftPosition} onChange={(e) => this.setShipParams(9, e, null, "leftPosition")} />
                            <span onClick={(e) => this.setShipParams(9, null, 'add', "leftPosition")}>+</span>
                        </div>
                    </li>
                    <li className='connect'>
                        {this.state.positionCtrl === true ? <LinkOutlined onClick={() => { this.lengthControl('position') }} /> : <DisconnectOutlined onClick={() => { this.lengthControl('position') }} />}
                    </li>
                    <li>
                        <i></i>
                        <span className="words">右吸口安装位置</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(10, null, 'reduce', "rightPosition")}>-</span>
                            <input type="text" value={tempData.rightPosition} onChange={(e) => this.setShipParams(10, e, null, "rightPosition")} />
                            <span onClick={(e) => this.setShipParams(10, null, 'add', "rightPosition")}>+</span>
                        </div>
                    </li>
                </ul>
                <p>其它</p>
                <ul>
                    {/* <li>
                        <i></i>
                        <span className="words">模拟方式</span>
                        <span className="degree">&nbsp;</span>
                        <div className="editValue solumFileList_content">
                            <select name="" onChange={(e) => this.changeControlStyle(e)} ref="changeControlStyle">
                                <option className='title-name'>自由模拟</option>
                                <option className='title-name'>实时模拟</option>
                            </select>
                        </div>
                    </li>
                    <li>
                        <i></i>
                        <span className="words">地质勘探报告</span>
                        <span className="degree">&nbsp;</span>
                        <div className="editValue solumFileList_content">
                            <select name="" id="solumFileList" onChange={(e) => this.changeSolumFile(e)} ref="solumFileList">
                                {solumFileName === "" ? "" :
                                    solumFileName.map((item, index) => (
                                        <option className='title-name' key={index}>{item.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </li> */}
                   <li>
                        <i></i>
                        <span className="words">土质</span>
                        <span className="degree">&nbsp;</span>
                        <div className="editValue solumFileList_content">
                            {/* <select name="" onChange={(e) => this.changeControlStyle(e)} ref="changeControlStyle"> */}
                            <select name="">
                                <option className='title-name'>黏土</option>
                                <option className='title-name'>淤泥</option>
                            </select>
                        </div>
                    </li>
                    <li>
                        <i></i>
                        <span className="words">波浪补偿器行程高度</span>
                        <span className="degree">m</span>
                        <div className="editValue">
                            <span onClick={(e) => this.setShipParams(13, null, 'reduce', "waveCompensator")}>-</span>
                            <input type="text" value={tempData.waveCompensator} onChange={(e) => this.setShipParams(13, e, null, "waveCompensator")} />
                            <span onClick={(e) => this.setShipParams(13, null, 'add', "waveCompensator")}>+</span>
                        </div>
                    </li>
                </ul>
            </div>
        )
    }
}

class WindowWraps extends Component {
    constructor(props) {
        super(props);
        this.closeProcss = this.closeProcss.bind(this)
        this.state = {
            outPutDataControl: this.props.isShowOut,//输出控制
            limitControl: false,//限值控制
            RightWinWrapSystemData: [
                { id: 1, leftUpDragLength: 21.42 },
                { id: 2, leftDownDragLength: 11.78 },
                { id: 3, rightUpDragLength: 21.42 },
                { id: 4, rightDownDragLength: 11.78 },
                { id: 5, dragWeight: 0 },
                { id: 6, dragDiameter: 0 },
                { id: 7, tubeDensity: 0 },
                { id: 8, pressWightPer: 0 },
                { id: 9, mudUpDistance: 0 },
                { id: 10, draftSetVal: 0 },
                { id: 11, leftPipeDiameter: 0},
                { id: 12, rightPipeDiameter: 0}
            ],
            LimitSet: [
                { id: 1, good: 15, max: 30, min: 0, val: '上耙管对地角度', attrName: 'DragUpAngle', unit: '度' },
                { id: 2, good: 0, max: 5, min: -5, val: '上耙管水平角度', attrName: 'UpDragHorAngle', unit: '度' },
                { id: 3, good: 45, max: 60, min: 30, val: '下耙管对地角度', attrName: 'DragDownAngle', unit: '度' },
                { id: 4, good: 0, max: 5, min: -5, val: '下耙管水平角度', attrName: 'DownDragHorAngle', unit: '度' },
                { id: 5, good: 10, max: 15, min: 5, val: '耙头活动罩角度', attrName: 'RunAngle', unit: '度' },
                { id: 6, good: 10, max: 180, min: 30, val: '上下耙管安全夹角', attrName: 'safeAngle', unit: '度' },
                { id: 7, good: 10, max: 40, min: 10, val: '耙臂挖深', attrName: 'goodDepth', unit: '度' }
            ],
            tempLimitSet: [{ id: 1, good: 15, max: 30, min: 0, val: '上耙管垂直角度（范围，最佳值）', attrName: 'DragUpAngle', unit: '度' },
                { id: 3, good: 45, max: 60, min: 30, val: '下耙管对地角度（范围，最佳值）', attrName: 'DragDownAngle', unit: '度' },
                { id: 5, good: 10, max: 15, min: 5, val: '耙头活动罩角度（范围，最佳值）', attrName: 'RunAngle', unit: '度' },
                { id: 6, good: 30, max: 60, min: 0, val: '上下耙管安全夹角（范围，最佳值）', attrName: 'RunAngle1', unit: '度' },
            ],
            outData: [
                { id: 0, val: '左/右耙头对地角度', out: 40, range: '22.56-48.9', good: 1 },
                { id: 1, val: '左/右耙上下耙管角度', out: 40, range: '22.56-48.9', good: 1 },
                { id: 2, val: '左/右耙挖深', out: 40, range: '22.56-48.9', good: 0 },
                { id: 2, val: '左/右耙耙臂水平角度', out: 40, range: '22.56-48.9', good: 0 }
            ],
            Analysis: [
                { val: 'G=G1+G2+G3=23.35+36.5+22.3=23.5kN' },
                { val: '耙头吊索内的拉力:T=GxLx-NxlN' },
                { val: '补偿器顶升模式下计算过程' },
                { val: '牵引力中间变量a=30,GW=321.51,G1=530.1' },
                { val: '耙头对地角度计算得28.5度' },
                { val: '耙头活动罩计算结果为33' }
            ],
            selected_submenu: 1,
        };
    }
    alaProcess = () => {
        this.setState({
            outPutDataControl: !this.state.outPutDataControl
        })
    }
    closeBox() {
        this.setState({
            outPutDataControl: false
        })
    }
    closeProcss() {
        if (this.state.outPutDataControl) {
            this.setState({
                outPutDataControl: false
            }, () => {
                this.setState({
                    outPutDataControl: true
                })
            })
        }
    }
    // 盒子显示控制
    isShowShrink = (id) => {
        let chooseVal = store.getState().chooseSystem;
        if (id === 0) {
            store.dispatch({
                type: 'IS_CLOSE',
                data: 0,
            });
            this.setState({
                outPutDataControl: false
            })
        } else if (id === 1) {
            this.setState({
                limitControl: false
            })
        } else if (id === 2) {
            store.dispatch({
                type: 'IS_CLOSE',
                data: 0,
            });
            this.setState({
                limitControl: true
            })
        } else {
            this.setState({
                limitControl: false
            })
            if (chooseVal === "运动参数") {
                store.dispatch({
                    type: 'IS_CLOSE',
                    data: 1,
                });
                store.dispatch({
                    type: 'CHOOSE_SYSTEM',
                    data: '运动参数',
                });
            }
        }

    }
    profile = () => {
        let _this = this;
        let state = store.getState().isViewClose;
        store.dispatch({
            type: 'ISVIEWTYPE',
            data: !state
        })
        if(state){
            _this.setState({
                selected_submenu: 2
            })
        }else{
            _this.setState({
                selected_submenu: 1
            })
        }
    }
    // 关闭时候切换参数
    setChooseVal = (e) => {
        store.dispatch({
            type: 'CHOOSE_SYSTEM',
            data: e,
        });
    }
    // 自由耙升下拉切换
    setChooseVal1 = (e) => {
        if (e === "运动参数") {
            store.dispatch({
                type: 'IS_CLOSE',
                data: 1,
            });
            store.dispatch({
                type: 'CHOOSE_SYSTEM',
                data: '运动参数',
            });
        } else if (e === "系统参数") {
            store.dispatch({
                type: 'IS_CLOSE',
                data: 2,
            });
            store.dispatch({
                type: 'CHOOSE_SYSTEM',
                data: '系统参数',
            });
        }
    }
    // 系统参数下拉切换
    setChooseVal2 = (e) => {
        if (e === "运动参数") {
            store.dispatch({
                type: 'IS_CLOSE',
                data: 1,
            });
            store.dispatch({
                type: 'CHOOSE_SYSTEM',
                data: '运动参数',
            });
        } else if (e === "系统参数") {
            store.dispatch({
                type: 'IS_CLOSE',
                data: 2,
            });
            store.dispatch({
                type: 'CHOOSE_SYSTEM',
                data: '系统参数',
            });
        }
    }
    // 控制多个按钮
    onAllShrink = () => {
        if (this.props.isClose === 0) {
            store.dispatch({
                type: 'IS_CLOSE',
                data: 1,
            });
        } else {
            store.dispatch({
                type: 'IS_CLOSE',
                data: 0,
            });
        }
    }
    render() {
        console.log(this.props);
        console.log(this.state);
        const { monitorType, solumFileName, isClose, dragLength, freeChange, viewType, isViewClose } = this.props;
        const { selected_submenu } = this.state;
        let content;
        switch (selected_submenu) {
            case 1:
                content = null;
                break;
            case 2:
                content = <Object3d app='land' />;
                break;
            default:
                break;
        }
        return (
            <>
                {this.state.outPutDataControl ? <RightWinWrapOutput freeChange={freeChange} outData={this.state.outData} alaData={this.state.Analysis} /> : ''}
                <div className='window-wraps'>
                    <div className='window-wrap right-window-boxs'>
                        <div className='win-wrap RakeDepth' style={{ 'display': isClose === 1 ? 'block' : 'none' }}>
                            <div className="win_wrap_content">
                                <div className="win_wrap_head">
                                    <div className="close">
                                        <span onClick={() => { this.isShowShrink(0) }}>&gt;&gt;</span>
                                        <span>
                                            {monitorType === 1 ? '自由模拟' : ''}
                                            {monitorType === 2 ? '耙头定深' : ''}
                                            {monitorType === 3 ? '系统参数' : ''}
                                        </span>
                                    </div>
                                    <div>
                                        {/* onClick={() => { wrapShrink(3) }} */}
                                        <span>
                                            <Select
                                                size='small'
                                                bordered={false}
                                                defaultValue="运动参数"
                                                style={{ width: 100 }}
                                                onChange={(e) => this.setChooseVal1(e)}
                                                key="444"
                                            >
                                                <Option key="1" value="运动参数"></Option>
                                            </Select>
                                        </span>
                                    </div>
                                </div>
                                <div className="win_wrap_main">
                                    {monitorType === 1 ? <RightWinWrapFree changeProce={this.closeProcss} LimitSet={this.state.LimitSet} systemParams={this.state.RightWinWrapSystemData} /> : null}
                                    {monitorType === 2 ? <RightWinWrapPairUp changeProce={this.closeProcss} LimitSet={this.state.LimitSet} system={dragLength} /> : null}
                                    {monitorType === 3 ?
                                        <>
                                            <SystemParams data={this.state.RightWinWrapSystemData} solumFileName={solumFileName} />
                                            <LimitSet data={this.state.tempLimitSet} />
                                        </>
                                        : null}
                                </div>
                                <div style={monitorType === 3 && monitorType === 4 && monitorType === 5 ? { 'display': 'none' } : { 'display': 'block' }} onClick={() => { this.alaProcess() }}>
                                    计算过程 &gt;&gt;
                                </div>
                            </div>
                        </div>
                        <div className="close_content" style={{ 'display': isClose === 0 ? 'block' : 'none' }}>
                            <span onClick={() => { this.isShowShrink(23) }}>&lt;&lt;</span>
                            <span>
                                <Select
                                    key="222"
                                    onChange={(e) => this.setChooseVal(e)}
                                    defaultValue="运动参数">
                                    <Option key="1" value="运动参数">运动参数</Option>
                                </Select>
                            </span>
                        </div>
                    </div>
                    <div className='window-wrap left-window-boxs'>
                        <div className='win-wrap RakeDepth' style={{ 'display': !isViewClose ? 'block' : 'none' }}>
                            <div className="win_wrap_content">
                                <div className="win_wrap_head">
                                    <div className="close">
                                        <span onClick={() => { this.isShowShrink(0) }}>&gt;&gt;</span>
                                        <span>
                                            {viewType === 1 ? '船尾剖面' : ''}
                                            {viewType === 2 ? '船体剖面' : ''}
                                        </span>
                                    </div>
                                    <div>
                                        {/* onClick={() => { wrapShrink(3) }} */}
                                        <span>
                                            <Select
                                                size='small'
                                                bordered={false}
                                                defaultValue="船尾剖面"
                                                style={{ width: 100 }}
                                                onChange={(e) => this.setChooseVal1(e)}
                                                key="444"
                                            >
                                                <Option key="1" value="船尾剖面">船尾剖面</Option>
                                                <Option key="2" value="船体剖面">船体剖面</Option>
                                            </Select>
                                        </span>
                                    </div>
                                </div>
                                <div className="win_wrap_main">
                                    {content}
                                </div>
                            </div>
                        </div>
                        <div className="close_content" style={{ 'display': isViewClose ? 'block' : 'none' }}>
                            <span>
                                <Select
                                    key="333"
                                    defaultValue="船尾剖面">
                                    <Option key="1" value="船尾剖面">船尾剖面</Option>
                                    <Option key="1" value="船尾剖面">船体剖面</Option>
                                </Select>
                            </span>
                            <span onClick={() => { this.profile() }}>&gt;&gt;</span>
                        </div>
                    </div>
                </div>
                <div id='all-shrink-btn' onClick={this.onAllShrink}></div>
            </>
        );
    }
}

class Scene extends Component {
    constructor(props) {
        super(props);
        this.isShowOutFn = this.isShowOutFn.bind(this)
        this.state = {
            x: 0,
            y: 0,
            left: 0,
            top: 0,
            isDown: false,
            leftV: 0,
            topV: 0,
            isShowOut: false,
        };
    }
    render() {
        const { monitorType, solumFileName, isClose, chooseSystem, dragLength, freeChange, viewType, isViewClose } = this.props;
        return (
            <div id='scene-wrap'>
                {/* 场景页面工具条 */}
                <div className='tool-row'>
                    <div className="scrollBar" style={{ left: this.state.leftV }} onMouseDown={(e) => { this.MoveDone(e) }} onMouseMove={(e) => { this.MoveMove(e) }} onMouseUp={(e) => { this.MoveUp(e) }} ref="scrollBar">
                        <ToolCol1 />
                        {/* {connect(mapStateToProps1)(ToolCol1)} */}
                        <ToolCol2 isShowOutFn={this.isShowOutFn} />
                        <ToolCol3 />
                    </div>
                </div>
                {/* 3d模块 */}
                <div className='viewport-container'>
                    <Object3d />
                </div>
                {/* 窗口块 */}

                <WindowWraps isViewClose={isViewClose} viewType={viewType} isShowOut={this.state.isShowOut} freeChange={freeChange} solumFileName={solumFileName} monitorType={monitorType} isClose={isClose} chooseSystem={chooseSystem} dragLength={dragLength} ref="WindowWraps" />
            </div>
        )

    }
    MoveDone(e) {
        e.stopPropagation();
        //开关打开
        let _this = this;
        this.setState(
            {
                x: e.clientX,
                y: e.clientY,
                left: _this.refs.scrollBar.offsetLeft,
                top: _this.refs.scrollBar.offsetTop,
                isDown: true
            }
        )
    }
    MoveMove(e) {
        if (e.target.nodeName !== 'INPUT') {
            e.stopPropagation();
            if (this.state.isDown === false) {
                return;
            }
            //获取x和y
            let nx = e.clientX;
            //计算移动后的左偏移量和顶部的偏移量
            let nl = nx - (this.state.x - this.state.left);
            this.setState({
                leftV: nl + 'px'
            })
        }

    }
    MoveUp() {
        this.setState({
            isDown: false
        })
    }
    isShowOutFn() {
        this.refs.WindowWraps.closeBox()
    }
}

function mapStateToProps(state) {
    console.log(state);
    return {
        solumFileName: state.solumFileName,
        loadingWord: state.loadingWord,
        monitorType: state.monitorType,
        isClose: state.isClose,
        chooseSystem: state.chooseSystem,
        dragLength: state.dragLength,
        freeChange: state.freeChange,
        viewType: state.viewType,
        isViewClose: state.isViewClose,
    }
}

export default connect(mapStateToProps)(Scene);
