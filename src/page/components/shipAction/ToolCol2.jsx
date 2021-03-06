import React, {Component} from 'react';
import {connect} from 'react-redux';
import store from '../../../redux/store';
import {changeWaterShow} from '../../main/3d/scene';
import {Switch} from 'antd';
import {transparentShip, setShipPosition} from '../../main/3d/ship';
import './less/toolCol2.less'
import {actionArmUp, actionArmDown} from '../../main/3d/ship/robotic-arm';

let timer = null;

class ToolCol2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            watch_btn: 1,
            childIs: 'none',
            switch_btn: false,
            switch_water_btn: true,
        };
    }
    componentWillMount () {
        this.state.switch_btn = store.getState().scenePageCtrlInfo.isTransparent
        this.state.switch_water_btn = store.getState().scenePageCtrlInfo.showWater
        this.state.watch_btn = store.getState().scenePageCtrlInfo.observeStatus
        console.log(this.state)
        console.log(store.getState().scenePageCtrlInfo)
    }

    onSwitchBtn = (checked) => {
        console.log(checked)
        // 船体透明
        transparentShip(checked);
        this.setState({
            switch_btn: checked,
        })
        store.dispatch({
            type: "SET_SCENE_PAGE_CTRL_INFO",
            data: {
                isTransparent: checked,
                showWater: store.getState().scenePageCtrlInfo.showWater,
                observeStatus: store.getState().scenePageCtrlInfo.observeStatus,
            }
        })
        console.log(store.getState().scenePageCtrlInfo)
    }
    onSwitchWaterBtn = (checked) => {
        console.log(checked)
        // 海水显示
        changeWaterShow(checked)
        this.setState({
            switch_water_btn: checked,
        })
        store.dispatch({
            type: "SET_SCENE_PAGE_CTRL_INFO",
            data: {
                isTransparent: store.getState().scenePageCtrlInfo.isTransparent,
                showWater: checked,
                observeStatus: store.getState().scenePageCtrlInfo.observeStatus,
            }
        })
        console.log(store.getState().scenePageCtrlInfo)
    }

    render() {
        const {watch_btn, switch_btn, switch_water_btn} = this.state;
        const {isRun} = this.props;
        return (
            <div className='tool-col'>
                <div className='col-box'>
                    <div className="ship_transition">
                        <span className='span-title'>船体透明</span>
                        <Switch size="small" onChange={this.onSwitchBtn} checked={store.getState().scenePageCtrlInfo.isTransparent}/>
                        <span className='span-title'>{switch_btn ? `on ` : 'off'}</span>
                    </div>
                    <div className="ship_transition">
                        <span className='span-title'>海水显示</span>
                        <Switch size="small" onChange={this.onSwitchWaterBtn} checked={store.getState().scenePageCtrlInfo.showWater}/>
                        <span className='span-title'>{switch_water_btn ? `on ` : 'off'}</span>
                    </div>
                    <div className='col-btns'>
                        <div className={watch_btn === 1 ? 'col-btn selected' : 'col-btn'} onClick={() => {
                            this.changeType(1)
                        }}>自由模拟
                        </div>
                        <div className={watch_btn === 2 ? 'col-btn selected' : 'col-btn'} onClick={() => {
                            this.changeType(2)
                        }}>耙头定深
                        </div>
                        <div className={watch_btn === 3 ? 'col-btn selected' : 'col-btn'} onClick={() => {
                            this.changeType(3)
                        }}>系统参数
                        </div>
                    </div>
                    <div className='col-btns'>
                        <span>航行</span>
                        <img className={isRun ? 'col-btn' : 'col-btn start'} onClick={() => {
                            this.ActionType(false)
                        }} src={require('../../../assets/stop.png')} alt=""/>
                        <img src={require('../../../assets/start.png')} className={isRun ? 'col-btn start' : 'col-btn'}
                             onClick={() => {
                                 this.ActionType(true)
                             }} alt=""/>
                    </div>
                </div>
            </div>
        );
    }

    ActionType = (state) => {
        store.dispatch({
            type: 'ISRUN',
            data: state
        })
        if (state) {
            timer = setInterval(() => {
                let pageInfo = this.props.scenePageInfo;
                let Xval = Math.sin(this.props.scenePageInfo.course * Math.PI / 180) * (1852 / 3600) * (this.props.scenePageInfo.speed);
                let Yval = Math.cos(this.props.scenePageInfo.course * Math.PI / 180) * (1852 / 3600) * (this.props.scenePageInfo.speed);
                let gps = {position: {x: -Number((pageInfo.GPSX + Xval)), y: Number((pageInfo.GPSY + Yval))}}
                setShipPosition(gps);
                pageInfo.GPSX = Number((pageInfo.GPSX + Xval));
                pageInfo.GPSY = Number((pageInfo.GPSY + Yval));
                store.dispatch({
                    type: 'SET_SCENE_PAGE_INFO',
                    data: pageInfo,
                })
                pageInfo = null;
            }, 1000);
        } else {
            clearInterval(timer)
        }

    }
    changeType = (idx) => {
        actionArmUp('左', 0, 0);
        actionArmUp('右', 0, 0);
        actionArmDown('左', 0, 0);
        actionArmDown('右', 0, 0);
        this.setState({
            watch_btn: idx
        })
        store.dispatch({
            type: 'SET_MONITOR_TYPE',
            data: idx,
        });
        store.dispatch({
            type: "SET_SCENE_PAGE_CTRL_INFO",
            data: {
                isTransparent: store.getState().scenePageCtrlInfo.isTransparent,
                showWater: store.getState().scenePageCtrlInfo.showWater,
                observeStatus: idx,
            }
        })
        this.props.isShowOutFn(false)
        console.log(this.state.data)
    }
}

function mapStateToProps(state) {
    return {
        isRun: state.isRun,
        scenePageInfo: state.scenePageInfo
    }
}

export default connect(mapStateToProps)(ToolCol2);
