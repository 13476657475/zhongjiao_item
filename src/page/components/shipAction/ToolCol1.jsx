import React, {Component} from 'react';
import {connect} from 'react-redux';
import store from '../../../redux/store';
import './less/toolCol1.less'
import {updateDraught, setShipRotation, setShipPosition} from '../../main/3d/ship';

class ToolCol1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            waterDepthFileName: [],
            WaterDepthRealFileName: [],
            solumFileName: [],
            mount: null,
            watch_btn: 1,
        };
    }

    // 速度
    shipSpeed = (e, idx) => {
        let pageInfo = this.props.scenePageInfo;
        let isNumber = Number(this.props.scenePageInfo.speed);
        if (idx === 1) {
            if(isNumber) {
                pageInfo.speed = (isNumber - 0.01).toFixed(2);
            } else {
                pageInfo.speed = 1;
            }
        } else if (idx === 2) {
                let val = e.target.value;
                let valLength = val.length;
                let valLast = val[val.length - 1];
                let keyVal = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "-", undefined];
                if(keyVal.includes(valLast)) {
                    let flag = false;
                    // 第一个数为0， 第二个必须为小数点
                    if((valLength == 2 && val[0] == "0" && val[1] != ".")) {
                        flag = true;
                    };
                    // 负号只能出现再最前面
                    if(valLast == "-" && valLength > 1) {
                        flag = true;
                    };
                    // 只允许出现一次小数点
                    if(valLast == "." && val.split(".").length >= 3) {
                        flag = true;
                    };
                    // 小数点后限制两位数
                    if(val.split(".").length > 1 && val.split(".")[1].length > 2) {
                        flag = true;
                    }
                    if(flag) return;
                    pageInfo.speed = e.target.value;
                }else {
                    return;
                };
                console.log(e.target.value);
                console.log(valLast);
                console.log(valLength);
                console.log(keyVal.includes(valLast));
        } else {
            if(isNumber) {
                pageInfo.speed = (isNumber + 0.01).toFixed(2);
            } else {
                pageInfo.speed = 1;
            }
            
        }
        store.dispatch({
            type: 'SET_SCENE_PAGE_INFO',
            data: pageInfo,
        })
        pageInfo = null;
    }
    // 航向
    shipRotation = (e, idx) => {
        console.log(idx);
        // debugger
        let pageInfo = this.props.scenePageInfo;
        if (idx === 1) {
            let val = Number(this.props.scenePageInfo.course);
            if(val) {
                pageInfo.course = (val - 1).toFixed(2);
            } else {
                pageInfo.course = (0 - 1).toFixed(2);
            }
            setShipRotation(this.props.scenePageInfo.course * Math.PI / 180);
        } else if (idx === 2) {
            let val = e.target.value;
            let valLength = val.length;
            let valLast = val[val.length - 1];
            let keyVal = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "-", undefined];
            if(keyVal.includes(valLast)) {
                let flag = false;
                // 第一个数为0， 第二个必须为小数点
                if((valLength == 2 && val[0] == "0" && val[1] != ".")) {
                    flag = true;
                };
                // 负号只能出现再最前面
                if(valLast == "-" && valLength > 1) {
                    flag = true;
                };
                // 只允许出现一次小数点
                if(valLast == "." && val.split(".").length >= 3) {
                    flag = true;
                };
                // 小数点后限制两位数
                if(val.split(".").length > 1 && val.split(".")[1].length > 2) {
                    flag = true;
                }
                if(flag) return;
                pageInfo.course = val;
                setShipRotation(Number(val) * Math.PI / 180);
            }else {
                return;
            };
        } else {
            let val = Number(this.props.scenePageInfo.course);
            if(val) {
                pageInfo.course = (val + 1).toFixed(2);
            } else {
                pageInfo.course = (0 + 1).toFixed(2);
            }
            setShipRotation(this.props.scenePageInfo.course * Math.PI / 180)
        }
        store.dispatch({
            type: 'SET_SCENE_PAGE_INFO',
            data: pageInfo,
        });
    }
    // 吃水
    shipDraft = (e, idx) => {
        let pageInfo = this.props.scenePageInfo;
        if (idx === 1) {
            pageInfo.draft = (Number(this.props.scenePageInfo.draft) - 1).toFixed(2);
            updateDraught(this.props.scenePageInfo.draft, this.props.scenePageInfo.tidemark)
        } else if (idx === 2) {
            let val = e.target.value;
            let valLength = val.length;
            let valLast = val[val.length - 1];
            let keyVal = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "-", undefined];
            if(keyVal.includes(valLast)) {
                let flag = false;
                // 第一个数为0， 第二个必须为小数点
                if((valLength == 2 && val[0] == "0" && val[1] != ".")) {
                    flag = true;
                };
                // 负号只能出现再最前面
                if(valLast == "-" && valLength > 1) {
                    flag = true;
                };
                // 只允许出现一次小数点
                if(valLast == "." && val.split(".").length >= 3) {
                    flag = true;
                };
                // 小数点后限制两位数
                if(val.split(".").length > 1 && val.split(".")[1].length > 2) {
                    flag = true;
                }
                if(flag) return;
                pageInfo.draft = val;
                setShipRotation(Number(val) * Math.PI / 180);
            }else {
                return;
            };
            updateDraught(e.target.value, this.props.scenePageInfo.tidemark)
        } else {
            pageInfo.draft = (Number(this.props.scenePageInfo.draft) + 1).toFixed(2);
            updateDraught(this.props.scenePageInfo.draft, this.props.scenePageInfo.tidemark)
        };
        store.dispatch({
            type: 'SET_SCENE_PAGE_INFO',
            data: pageInfo,
        })
    };
    
    shipGps = (e, type) => {
        if (e !== null) {
            let pageInfo = this.props.scenePageInfo;
            let val = e.target.value;
            let valLength = val.length;
            let valLast = val[val.length - 1];
            let keyVal = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "-", undefined];
            let flag = false;
            if (type === 'x') {
                if(keyVal.includes(valLast)) {
                    // 第一个数为0， 第二个必须为小数点
                    if((valLength == 2 && val[0] == "0" && val[1] != ".")) {
                        flag = true;
                    };
                    // 负号只能出现再最前面
                    if(valLast == "-" && valLength > 1) {
                        flag = true;
                    };
                    // 只允许出现一次小数点
                    if(valLast == "." && val.split(".").length >= 3) {
                        flag = true;
                    };
                    // 小数点后限制两位数
                    if(val.split(".").length > 1 && val.split(".")[1].length > 2) {
                        flag = true;
                    }
                    if(flag) return;
                    pageInfo.GPSX = val;
                }else {
                    return;
                };
            } else if (type === 'y') {
                if(keyVal.includes(valLast)) {
                    // 第一个数为0， 第二个必须为小数点
                    if((valLength == 2 && val[0] == "0" && val[1] != ".")) {
                        flag = true;
                    };
                    // 负号只能出现再最前面
                    if(valLast == "-" && valLength > 1) {
                        flag = true;
                    };
                    // 只允许出现一次小数点
                    if(valLast == "." && val.split(".").length >= 3) {
                        flag = true;
                    };
                    // 小数点后限制两位数
                    if(val.split(".").length > 1 && val.split(".")[1].length > 2) {
                        flag = true;
                    }
                    if(flag) return;
                    pageInfo.GPSY = val;
                }else {
                    return;
                };
            };
            store.dispatch({
                type: 'SET_SCENE_PAGE_INFO',
                data: pageInfo,
            })
            let gps = {position: {x: Number((pageInfo.GPSX)), y: Number((pageInfo.GPSY))}}
            setShipPosition(gps);
        }
    }

    render() {
        const {scenePageInfo} = this.props;
        return (
            <div className='tool-col'>
                <ul>
                    <li>
                        <i/>
                        <span>航速</span>
                        <div className="editValue">
                            <span onClick={(e) => this.shipSpeed(e, 1)}>-</span>
                            <input value={scenePageInfo.speed} onInput={(e) => this.shipSpeed(e, 2)}/>
                            <span onClick={(e) => this.shipSpeed(e, 3)}>+</span>
                        </div>
                    </li>
                    <li>
                        <i/>
                        <span>航向</span>
                        <div className="editValue">
                            <span onClick={(e) => this.shipRotation(e, 1)}>-</span>
                            <input value={scenePageInfo.course} onInput={(e) => this.shipRotation(e, 2)}/>
                            <span onClick={(e) => this.shipRotation(e, 3)}>+</span>
                        </div>
                    </li>
                    <li>
                        <i/>
                        <span>船体吃水</span>
                        <div className="editValue">
                            <span onClick={(e) => this.shipDraft(e, 1)}>-</span>
                            <input value={scenePageInfo.draft} onInput={(e) => this.shipDraft(e, 2)}/>
                            <span onClick={(e) => this.shipDraft(e, 3)}>+</span>
                        </div>
                    </li>
                    <li className='GPS'>
                        <i/>
                        <span>GPS</span>
                        <span>(
                          <input type="text" value={scenePageInfo.GPSX}
                                 onChange={(e) => this.shipGps(e, 'x')}/>,
                          <input value={scenePageInfo.GPSY}
                                 onChange={(e) => this.shipGps(e, 'y')}/>
                          )</span>
                    </li>
                </ul>
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        scenePageInfo: state.scenePageInfo
    }
}

export default connect(mapStateToProps)(ToolCol1);
