import React, { Component } from 'react';
import 'antd/dist/antd.css';
import './index.less';
import { Layout,message } from 'antd';
import { connect } from 'react-redux';
import Object3d from '../3d';
import { switchMode } from '../3d/land/scene';

const { Header, Content, Sider } = Layout;
class Hydrogeology extends Component{
    constructor(props){
        super(props);
        this.state = {
            listData:[
                { id: 1, info: '第一次障碍', gpsX: 300, gpsY: 10 },
                { id: 2, info: '第二次障碍', gpsX: 300, gpsY: 10 },
                { id: 3, info: '第三次障碍', gpsX: 300, gpsY: 10 },
                { id: 4, info: '第四次障碍', gpsX: 300, gpsY: 10 }
            ]
        }
    }
    
    onClickBtn = (mode) => {
        // if(this.props.waterOrSolume === '地质文件'){
            if(mode === '剖面') message.info('请选择两个点，划作剖面');
            switchMode(mode);
        // }
    }

    render(){
        const { waterOrSolume } = this.props;
        return(
            <div id = "Hydrogeology">
                <Layout style={{ height: '100%' }}>
                    {/* <Sider width={60} style={{ height: 'calc(100vh - 50px)' }}>
                        <div className="barrierList">
                            <p className = "barrier_List_Title">障碍物列表</p>
                            <ul>
                               {
                                   this.state.listData.map( item =>(
                                    <li key={item.id} onClick = { ()=> { this.barrier( item.id )}}>{ item.gpsX },{ item.gpsY }</li>
                                   ))
                               }
                            </ul>
                        </div>
                    </Sider> */}
                    {/* <Layout> */}
                    <Layout style={{ height: '100%' }}>
                        <Header>
                            <div className = "head">
                                <div className="titleLeft">
                                    <div></div>
                                    <div></div>
                                   <div className="threeBtn" onClick={()=>{this.onClickBtn('三维')}}>
                                       <img src={require("./img/waterDepth3D.png")} alt=""/>
                                       <p>三维</p>
                                   </div>
                                   <div className="threeBtn" onClick={()=>{this.onClickBtn('剖面')}} style={{display:waterOrSolume==='水深文件'?'none':'flex'}}>
                                   <img src={require("./img/section.png")} alt=""/>
                                       <p>剖面</p>
                                   </div>
                                </div>
                            </div>
                        </Header>
                        <Content style={{height:'100%',width:'100%'}}>
                            <Object3d app='land' />
                        </Content>
                    </Layout>
                </Layout>
            </div>
        )
    }
}
function mapStateToProps(state) {
    return {
        waterOrSolume: state.waterOrSolume
    }
}
export default connect(mapStateToProps)(Hydrogeology);