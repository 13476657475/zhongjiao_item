import React, { Component } from 'react';
import './index.less';
import { connect } from 'react-redux';
import Scene from './scene';
import { requestParentData, GPSInfo, userTimer } from './requestParent';
import {
    GUID,
    changeDepth, //移除河床
    upLandData, //更新水深文件
} from './3d/scene';
import store from '../../redux/store';

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_submenu: 1, // 选中的子菜单
            waterDepthFileName: [],
            WaterDepthRealFileName: [],
            maxHieght: 0
        };
    }
    //切换主菜单，暂时不用
    onSubMenu = (num) => {
        this.setState({
            selected_submenu: num,
        })
    }
    componentDidMount() {
        this.setState({
            maxHieght: document.body.clientHeight
        })
        window.addEventListener('resize', this.handleHeight);
        // requestParentData();
        userTimer()
    }
    handleHeight = () => {
        let Height1 = document.body.clientHeight;
        console.log(Height1)
        this.setState({
            maxHieght: Height1
        })
    }
    //切换水深文件入口
    changeDepthFile(e) {
        let Files = store.getState().WaterDepthRealFileName;
        for (let i = 0; i < Files.length; i++) {
            if (Files[i].name === e.target.value) {
                store.dispatch({
                    type: 'SET_LOADING',
                    data: true,
                });
                changeDepth();//移除河床
                let xguid = GUID()
                upLandData({
                    method: 'land_init',
                    start_time: Math.floor(new Date() / 1000),
                    water_depth_file_name: Files[i].real_name,
                    gpsX: GPSInfo.position.x, gpsY: GPSInfo.position.y,
                    guid: xguid,
                })
            }
        }
    }
    render() {
        const { waterDepthFileName, isLoading, loadingWord } = this.props;
        const { selected_submenu } = this.state;
        let content;
        switch (selected_submenu) {
            case 1:
                content = <Scene />;
                break;
            default:
                break;
        }
        return (
            <div id='dredging-wrap'>
                <header className='dredging-header'>
                    <div className='header-title'>
                        <img alt="" />
                        <select name="" id="depthFileList" onChange={(e) => this.changeDepthFile(e)} ref="depthFileList" >
                            {waterDepthFileName === "" ? "" :
                                waterDepthFileName.map((item, index) => (
                                    <option className='title-name' key={index}>{item.name}</option>
                                ))
                            }
                        </select>
                    </div>
                    <ul className='header-menu'>
                        <li className={(selected_submenu === 1) ? 'header-submenu selected' : 'header-submenu'}
                            onClick={() => { this.onSubMenu(1) }}
                        >
                            仿真模拟
                            </li>
                        {/* <li className={(selected_submenu === 2) ? 'header-submenu selected' : 'header-submenu'}
                            onClick={() => { this.onSubMenu(2) }}
                        >
                            水文地质
                            </li> */}
                    </ul>
                </header>
                {/* 内容部分 */}
                <div style={{ height: this.state.maxHieght }}>
                    {content}
                </div>
                {
                    isLoading === false ? "" : <div className="onloading" >
                        <div>
                            <img src={require('./img/loading.gif')} alt="" />
                            <p>{loadingWord}</p>
                        </div>
                    </div>
                }
            </div>
        )
    }
}


function mapStateToProps(state) {
    return {
        waterDepthFileName: state.waterDepthFileName,
        WaterDepthRealFileName: state.WaterDepthRealFileName,
        isLoading: state.isLoading,
        loadingWord: state.loadingWord
    }
}

export default connect(mapStateToProps)(Main);
