import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../../../redux/store';
import './less/toolCol3.less';

import { changeDayNight } from '../../main/3d/scene';
import { updateDraught } from '../../main/3d/ship';

import { updateSeaLevel } from '../../main/3d/scene/water';
class ToolCol3 extends Component {

  constructor(props) {
      super(props);
      this.state = {
          fov_btn: 1,
          childIs: 'none',
          current_time: new Date().Format("h:m:s yyyy-M-d")
      };
  }
  shipTidemark = (e, idx) => {
    let pageInfo = this.props.scenePageInfo;
      if (idx === 1) {
        let val = Number(this.props.scenePageInfo.tidemark)
        pageInfo.tidemark = val - 1;
        updateSeaLevel((val - 1)); // 设置潮位
        updateDraught(this.props.scenePageInfo.draft, (val - 1))
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
            pageInfo.tidemark = val;
            updateSeaLevel(this.props.scenePageInfo.tidemark); // 设置潮位
            updateDraught(this.props.scenePageInfo.draft, this.props.scenePageInfo.tidemark)
        }else {
            return;
        };
      } else {
          let val = Number(this.props.scenePageInfo.tidemark)
          pageInfo.tidemark = val + 1;
          updateSeaLevel((val + 1)); // 设置潮位
          updateDraught(this.props.scenePageInfo.draft, (val + 1))
      };
      store.dispatch({
        type: 'SET_SCENE_PAGE_INFO',
        data: pageInfo,
    })
  }
  ActionType = (id) => {
      this.setState({
          fov_btn: id
      })
      changeDayNight(id)
  }
  render() {
      const { current_time, fov_btn } = this.state;
      const { scenePageInfo } = this.props;
      return (
          <div className='tool-col'>
              <div className='col-box'>
                  <div className='col-btns'>
                      <i />
                      <span>潮位</span>
                      <div className="editValue">
                          <span onClick={(e) => this.shipTidemark('reduce', 1)}>-</span>
                          <input value={scenePageInfo.tidemark} onChange={(e) => this.shipTidemark(e, 2)} />
                          <span onClick={(e) => this.shipTidemark('add', 3)}>+</span>
                      </div>
                  </div>
              </div>
              <div className='col-box'>
                  <div className='col-btns'>
                      <span>昼夜</span>
                      <img className={fov_btn === 1 ? 'col-btn' : 'col-btn start'} onClick={() => {
                          this.ActionType(2)
                      }} src={require('../../../assets/day.png')} alt="" />
                      <img src={require('../../../assets/night.png')} className={fov_btn === 1 ? 'col-btn start' : 'col-btn'} onClick={() => {
                          this.ActionType(1)
                      }} alt="" />
                  </div>
              </div>
              <div className='col-time-box'>
                  <i />
                  <span>{current_time}</span>
              </div>
              <img alt="" />
          </div>
      );
  }
  componentDidMount() {
      this.timerID = setInterval(
          () => this.tick(),
          1000
      );
      let currdate = new Date();
      if (currdate.getHours() >= 20 || currdate.getHours() < 7) {
          this.setState({
              fov_btn: 2
          })
      } else {
          this.setState({
              fov_btn: 1
          })
      }
  }

  componentWillUnmount() {
      clearInterval(this.timerID);
  }
  tick() {
      this.setState({
          current_time: new Date().Format("h:m:s yyyy-M-d")
      });
  }
  createShip() {
      this.setState({
          childIs: 'block'
      })
  }

}function mapStateToProps(state) {
  return {
    scenePageInfo:state.scenePageInfo
  }
}
export default connect(mapStateToProps)(ToolCol3);