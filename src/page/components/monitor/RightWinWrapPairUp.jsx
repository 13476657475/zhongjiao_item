import React, {Component} from 'react';
import {connect} from 'react-redux';
import {message, Checkbox} from 'antd';
import store from '../../../redux/store';
import {LinkOutlined, DisconnectOutlined} from '@ant-design/icons';
import {runRank, actionArmUp, actionArmDown, targetHeadArm, actionArm} from '../../main/3d/ship/robotic-arm';

class RightWinWrapPairUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            isClose: 0,
            data: this.props.depthData,
            displayData: this.props.depthData, // 用于参数调整显示的数据
            sysData: this.props.system,
            limitData: this.props.LimitSet,
            upControlLength: true,
            downControlLength: true,
            upHorControlLength: true,
            downHorControlLength: true,
            downhead: true,
            depth: true,
            checked: false,
            overallEvaluation: [],
            displayOverallEvaluation: [],
            guidance: [],
            displayGuidance : [],
            leftOrRight: "双耙"
        };
    }
    componentDidMount() {
        this.getOverallEvaluation()
    }

    setShipParams = (index, e, type, str) => {
        console.log("耙头定深");
        console.log(index);
        console.log(str);
        //   runRank(index, e, type, str)
        //   debugger
          this.props.changeProce()
        //   let items = JSON.parse(JSON.stringify(this.state.data));
          let items = this.state.data;
          console.log(this.state.checked);
          if (str === undefined) return;
          let attrName = str.split(',');
          let tempL = attrName[0];
          let tempR = attrName[1];
          if (e !== null) {
            //   let temp = e.target === undefined ? e[e.reName] : e.target.value;
            // 校验输入的格式
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
              if ((index === 2 || index === 4) && this.state.depth) {
                  if (!this.state.checked) {
                      let ang = this.konwDepthGetAngle(Number(temp)) * 180 / Math.PI;
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              item[tempL] = temp;
                          } else if (item.hasOwnProperty(tempR)) {
                              item[tempR] = temp
                          } else if (item.hasOwnProperty('leftDragUpAngle')) {
                              item['leftDragUpAngle'] = Number(temp)? Number((90 - ang).toFixed(2)) : 0
                          } else if (item.hasOwnProperty('rightDragUpAngle')) {
                              item['rightDragUpAngle'] = Number(temp)? Number((90 - ang).toFixed(2)) : 0
                          } else if (item.hasOwnProperty('leftDragDownAngle')) {
                              item['leftDragDownAngle'] = Number(temp)? Number((90 - ang).toFixed(2)) : 0
                          } else if (item.hasOwnProperty('rightDragDownAngle')) {
                              item['rightDragDownAngle'] = Number(temp)? Number((90 - ang).toFixed(2)) : 0
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else if ((index === 5 || index === 7) && this.state.upControlLength) {
                  if (!this.state.checked) {
                      let length = this.props.dragLength;
                      //获取角度
                      let ang = this.changeAngleGetAngle(2, Number(temp) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                      let downAng = (Math.asin(ang) * 180 / Math.PI);
                      //耙臂动作
                      //更新数据
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              item[tempL] = temp;
                          } else if (item.hasOwnProperty(tempR)) {
                              item[tempR] = temp;
                          } else if (item.hasOwnProperty('leftDragDownAngle')) {
                              item['leftDragDownAngle'] = Number(temp) ? Number(downAng.toFixed(2)) : 0;
                          } else if (item.hasOwnProperty('rightDragDownAngle')) {
                              item['rightDragDownAngle'] = Number(temp) ? Number(downAng.toFixed(2)) : 0;
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else if ((index === 8 || index === 10) && this.state.upHorControlLength) {
                  //耙臂动作
                  //更新数据
                  items.forEach(item => {
                      if (item.hasOwnProperty(tempL)) {
                          item[tempL] = temp;
                      } else if (item.hasOwnProperty(tempR)) {
                          item[tempR] = temp;
                      }
                  });
              } else if ((index === 11 || index === 13) && this.state.downControlLength) {
                  if (!this.state.checked) {
                      let length = this.props.dragLength;
                      //获取角度
                      let ang = this.changeAngleGetAngle(1, Number(temp) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                      let upAng = (Math.asin(ang) * 180 / Math.PI);
                      //耙臂动作
                      //更新数据
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              item[tempL] = temp;
                          } else if (item.hasOwnProperty(tempR)) {
                              item[tempR] = temp;
                          } else if (item.hasOwnProperty('leftDragUpAngle')) {
                              item['leftDragUpAngle'] = Number(temp)? Number(upAng.toFixed(2)) : 0;
                          } else if (item.hasOwnProperty('rightDragUpAngle')) {
                              item['rightDragUpAngle'] = Number(temp)? Number(upAng.toFixed(2)) : 0;
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else if ((index === 14 || index === 16) && this.state.downHorControlLength) {
                  //更新数据
                  items.forEach(item => {
                      if (item.hasOwnProperty(tempL)) {
                          item[tempL] = temp;
                      } else if (item.hasOwnProperty(tempR)) {
                          item[tempR] = temp;
                      }
                  });
              } else if ((index === 17 || index === 19) && this.state.downhead) {
                  if (!this.state.checked) {
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              item[tempL] = temp;
                          } else if (item.hasOwnProperty(tempR)) {
                              item[tempR] = temp;
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else {
                  let ang = this.konwDepthGetAngle(Number(temp)) * 180 / Math.PI;
                  switch (index) {
                      case 2:
                          if (!this.state.checked) {
                            //   items[1]['leftDragDepth'] = temp;
                              items[4]['leftDragUpAngle'] = Number(temp) ? (90 - ang).toFixed(2) : 0;
                              items[10]['leftDragDownAngle'] = Number(temp) ? (90 - ang).toFixed(2) : 0;
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 4:
                          if (!this.state.checked) {
                              items[6]['rightDragUpAngle'] = (90 - ang).toFixed(2);
                              items[12]['rightDragDownAngle'] = (90 - ang).toFixed(2);
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 5:
                          if (!this.state.checked) {
                              let length = this.props.dragLength;
                              //获取角度
                              let ang = this.changeAngleGetAngle(2, Number(temp) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                              let downAng = (Math.asin(ang) * 180 / Math.PI);
                              //更新数据
                              items[4]['leftDragUpAngle'] = temp;
                              items[10]['leftDragDownAngle'] = Number(temp) ? Number(downAng.toFixed(2)) : 0;
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 7:
                          if (!this.state.checked) {
                              let length1 = this.props.dragLength;
                              //获取角度
                              let ang1 = this.changeAngleGetAngle(2, Number(temp) * Math.PI / 180, length1.leftUpLength, length1.leftDownLength, items[1]['leftDragDepth']);
                              let downAng1 = (Math.asin(ang1) * 180 / Math.PI);
                              items[6]['rightDragUpAngle'] = temp;
                              items[12]['rightDragDownAngle'] = Number(temp) ? Number(downAng1.toFixed(2)) : 0;
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 8:
                          //更新数据
                          items[7]['leftDragUpHorAngle'] = temp;
                          break;
                      case 10:
                          items[9]['rightDragUpHorAngle'] = Number(temp) ?  Number(Number(temp).toFixed(2)) : 0;
                          break;
                      case 11:
                          if (!this.state.checked) {
                              let length2 = this.props.dragLength;
                              //获取角度
                              let ang2 = this.changeAngleGetAngle(1, Number(temp) * Math.PI / 180, length2.leftUpLength, length2.leftDownLength, items[1]['leftDragDepth']);
                              let upAng2 = (Math.asin(ang2) * 180 / Math.PI);
                              //耙臂动作
                              //更新数据
                              items[4]['leftDragUpAngle'] = Number(upAng2.toFixed(2));
                              items[10]['leftDragDownAngle'] = Number(Number(temp).toFixed(2));
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 13:
                          if (!this.state.checked) {
                              let length3 = this.props.dragLength;
                              //获取角度
                              let ang3 = this.changeAngleGetAngle(1, Number(temp) * Math.PI / 180, length3.leftUpLength, length3.leftDownLength, items[1]['leftDragDepth']);
                              let upAng3 = (Math.asin(ang3) * 180 / Math.PI);
                              items[6]['rightDragUpAngle'] = Number(upAng3.toFixed(2));
                              items[12]['rightDragDownAngle'] = temp;
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 14:
                          items[13]['leftDragDownHorAngle'] = temp;
                          break;
                      case 16:
                          items[15]['rightDragDownHorAngle'] = temp;
                          break;
                      case 17:
                          if (!this.state.checked) {
                              items[16]['leftRunAngle'] = temp;
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 19:
                          if (!this.state.checked) {
                              items[18]['rightRunAngle'] = temp;
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      default:
                  }
              }
          } else if (type === 'reduce') {
              if ((index === 2 || index === 4) && this.state.depth) {
                  if (!this.state.checked) {
                      let ang1 = this.konwDepthGetAngle((items[1]['leftDragDepth'] - 1)) * 180 / Math.PI;
                      let ang2 = this.konwDepthGetAngle((items[3]['rightDragDepth'] - 1)) * 180 / Math.PI;
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              if(items[1]['leftDragDepth'].toString().includes(".")) {
                                item[tempL] = (+items[1]['leftDragDepth'] - 1).toFixed(2);
                              } else {
                                item[tempL] = +items[1]['leftDragDepth'] - 1;
                              }
                          } else if (item.hasOwnProperty(tempR)) {
                              if(items[3]['rightDragDepth'].toString().includes(".")) {
                                item[tempR] = (+items[3]['rightDragDepth'] - 1).toFixed(2);
                              } else {
                                item[tempR] = +items[3]['rightDragDepth'] - 1;
                              }
                          } else if (item.hasOwnProperty('leftDragUpAngle')) {
                              item['leftDragUpAngle'] = Number((90 - ang1).toFixed(2))
                          } else if (item.hasOwnProperty('rightDragUpAngle')) {
                              item['rightDragUpAngle'] = Number((90 - ang2).toFixed(2))
                          } else if (item.hasOwnProperty('leftDragDownAngle')) {
                              item['leftDragDownAngle'] = Number((90 - ang1).toFixed(2))
                          } else if (item.hasOwnProperty('rightDragDownAngle')) {
                              item['rightDragDownAngle'] = Number((90 - ang2).toFixed(2))
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else if ((index === 5 || index === 7) && this.state.upControlLength) {
                  if (!this.state.checked) {
                      // debugger
                      let length = this.props.dragLength;
                      //获取角度
                      let ang1 = this.changeAngleGetAngle(2, (items[4]['leftDragUpAngle'] - 1) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                      let ang2 = this.changeAngleGetAngle(2, (items[6]['rightDragUpAngle'] - 1) * Math.PI / 180, length.rightUpLength, length.rightDownLength, items[3]['rightDragDepth']);
                      let downAng1 = (Math.asin(ang1) * 180 / Math.PI);
                      let downAng2 = (Math.asin(ang2) * 180 / Math.PI);
                      //耙臂动作
                      // debugger
                      //更新数据
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              if(items[4]['leftDragUpAngle'].toString().includes(".")) {
                                item[tempL] = (+items[4]['leftDragUpAngle'] - 1).toFixed(2);
                              } else {
                                item[tempL] = +items[4]['leftDragUpAngle'] - 1;
                              }
                          } else if (item.hasOwnProperty(tempR)) {
                              if(items[6]['rightDragUpAngle'].toString().includes(".")) {
                                item[tempR] = (+items[6]['rightDragUpAngle'] - 1).toFixed(2);
                              } else {
                                item[tempR] = +items[6]['rightDragUpAngle'] - 1;
                              }
                          } else if (item.hasOwnProperty('leftDragDownAngle')) {
                              item['leftDragDownAngle'] = Number(downAng1.toFixed(2))
                          } else if (item.hasOwnProperty('rightDragDownAngle')) {
                              item['rightDragDownAngle'] = Number(downAng2.toFixed(2))
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else if ((index === 8 || index === 10) && this.state.upHorControlLength) {
                  //耙臂动作
                  //更新数据
                  items.forEach(item => {
                      if (item.hasOwnProperty(tempL)) {
                          if(items[7]['leftDragUpHorAngle'].toString().includes(".")) {
                            item[tempL] = (+items[7]['leftDragUpHorAngle'] - 1).toFixed(2);
                          } else {
                            item[tempL] = +items[7]['leftDragUpHorAngle'] - 1;
                          }
                      } else if (item.hasOwnProperty(tempR)) {
                          if(items[9]['rightDragUpHorAngle'].toString().includes(".")) {
                            item[tempR] = (+items[9]['rightDragUpHorAngle'] - 1).toFixed(2);
                          } else {
                            item[tempR] = +items[9]['rightDragUpHorAngle'] - 1;
                          }
                      }
                  });
              } else if ((index === 11 || index === 13) && this.state.downControlLength) {
                  if (!this.state.checked) {
                      let length = this.props.dragLength;
                      //获取角度
                      let ang1 = this.changeAngleGetAngle(1, (items[10]['leftDragDownAngle'] - 1) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                      let ang2 = this.changeAngleGetAngle(1, (items[12]['rightDragDownAngle'] - 1) * Math.PI / 180, length.rightUpLength, length.rightDownLength, items[3]['rightDragDepth']);
                      let upAng1 = (Math.asin(ang1) * 180 / Math.PI);
                      let upAng2 = (Math.asin(ang2) * 180 / Math.PI);
                      //耙臂动作
                      //更新数据
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              if(items[10]['leftDragDownAngle'].toString().includes(".")) {
                                item[tempL] = (+items[10]['leftDragDownAngle'] - 1).toFixed(2);
                              } else {
                                item[tempL] = +items[10]['leftDragDownAngle'] - 1;
                              }
                          } else if (item.hasOwnProperty(tempR)) {
                              if(items[12]['rightDragDownAngle'].toString().includes(".")) {
                                item[tempR] = (+items[12]['rightDragDownAngle'] - 1).toFixed(2);
                              } else {
                                item[tempR] = +items[12]['rightDragDownAngle'] - 1;
                              }
                          } else if (item.hasOwnProperty('leftDragUpAngle')) {
                              item['leftDragUpAngle'] = Number(upAng1.toFixed(2));
                          } else if (item.hasOwnProperty('rightDragUpAngle')) {
                              item['rightDragUpAngle'] = Number(upAng2.toFixed(2));
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else if ((index === 14 || index === 16) && this.state.downHorControlLength) {
                  //更新数据
                  items.forEach(item => {
                      if (item.hasOwnProperty(tempL)) {
                          if(items[13]['leftDragDownHorAngle'].toString().includes(".")) {
                            item[tempL] = (+items[13]['leftDragDownHorAngle'] - 1).toFixed(2);
                          } else {
                            item[tempL] = +items[13]['leftDragDownHorAngle'] - 1;
                          }
                      } else if (item.hasOwnProperty(tempR)) {
                          if(items[15]['rightDragDownHorAngle'].toString().includes(".")) {
                            item[tempR] = (+items[15]['rightDragDownHorAngle'] - 1).toFixed(2);
                          } else {
                            item[tempR] = +items[15]['rightDragDownHorAngle'] - 1;
                          }
                      }
                  });
              } else if ((index === 17 || index === 19) && this.state.downhead) {
                  if (!this.state.checked) {
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              item[tempL] = items[16]['leftRunAngle'].toString().includes(".") ? (+items[16]['leftRunAngle'] - 1).toFixed(2) : +items[16]['leftRunAngle'] - 1;
                          } else if (item.hasOwnProperty(tempR)) {
                              item[tempR] = items[18]['rightRunAngle'].toString().includes(".") ? (+items[18]['rightRunAngle'] - 1).toFixed(2) : +items[18]['rightRunAngle'] - 1
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else {
                  let angleftDep = this.konwDepthGetAngle((items[1]['leftDragDepth'] - 1)) * 180 / Math.PI;
                  let angrightDep = this.konwDepthGetAngle((items[3]['rightDragDepth'] - 1)) * 180 / Math.PI;
                  let length = this.props.dragLength;
                  switch (index) {
                      case 2:
                          if (!this.state.checked) {
                              items[1]['leftDragDepth'] = items[1]['leftDragDepth'].toString().includes(".") ? (+items[1]['leftDragDepth'] - 1).toFixed(2) : +items[1]['leftDragDepth'] - 1;
                              items[4]['leftDragUpAngle'] = Number((90 - angleftDep).toFixed(2));
                              items[10]['leftDragDownAngle'] = Number((90 - angleftDep).toFixed(2));
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 4:
                          if (!this.state.checked) {
                              items[3]['rightDragDepth'] = items[3]['rightDragDepth'].toString().includes(".") ? (+items[3]['rightDragDepth'] - 1).toFixed(2) : +items[3]['rightDragDepth'] -1;
                              items[6]['rightDragUpAngle'] = Number((90 - angrightDep).toFixed(2));
                              items[12]['rightDragDownAngle'] = Number((90 - angrightDep).toFixed(2));
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 5:
                          if (!this.state.checked) {
                              //获取角度
                              let angLeftUp = this.changeAngleGetAngle(2, (items[4]['leftDragUpAngle'] - 1) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
  
                              let downAng = (Math.asin(angLeftUp) * 180 / Math.PI);
                              //更新数据
                              items[4]['leftDragUpAngle'] = items[4]['leftDragUpAngle'].toString().includes(".") ? (+items[4]['leftDragUpAngle'] - 1).toFixed(2) : +items[4]['leftDragUpAngle'] - 1;
                              items[10]['leftDragDownAngle'] = Number(downAng.toFixed(2));
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 7:
                          if (!this.state.checked) {
                              //获取角度
                              let angRightUp = this.changeAngleGetAngle(2, (items[6]['rightDragUpAngle'] - 1) * Math.PI / 180, length.rightUpLength, length.rightDownLength, items[3]['rightDragDepth']);
                              let downAng1 = (Math.asin(angRightUp) * 180 / Math.PI);
                              items[6]['rightDragUpAngle'] = items[6]['rightDragUpAngle'].toString().includes(".") ? (+items[6]['rightDragUpAngle'] - 1).toFixed(2) : +items[6]['rightDragUpAngle'] - 1;
                              items[12]['rightDragDownAngle'] = Number(downAng1.toFixed(2));
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 8:
                          //更新数据
                          items[7]['leftDragUpHorAngle'] = items[7]['leftDragUpHorAngle'].toString().includes(".") ? (+items[7]['leftDragUpHorAngle'] - 1).toFixed(2) : +items[7]['leftDragUpHorAngle'] - 1;
                          break;
                      case 10:
                          items[9]['rightDragUpHorAngle'] = items[9]['rightDragUpHorAngle'].toString().includes(".") ? (+items[9]['rightDragUpHorAngle'] - 1).toFixed(2) : +items[9]['rightDragUpHorAngle'] - 1;
                          break;
                      case 11:
                          if (!this.state.checked) {
                              let ang2 = this.changeAngleGetAngle(1, (items[10]['leftDragDownAngle'] - 1) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                              let upAng2 = (Math.asin(ang2) * 180 / Math.PI);
                              //耙臂动作
                              //更新数据
                              items[4]['leftDragUpAngle'] = Number(upAng2.toFixed(2));
                              items[10]['leftDragDownAngle'] = items[10]['leftDragDownAngle'].toString().includes(".") ? (+items[10]['leftDragDownAngle'] - 1).toFixed(2) : +items[10]['leftDragDownAngle'] - 1;
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 13:
                          if (!this.state.checked) {
                              let ang3 = this.changeAngleGetAngle(1, (items[12]['rightDragDownAngle'] - 1) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                              let upAng3 = (Math.asin(ang3) * 180 / Math.PI);
                              items[6]['rightDragUpAngle'] = Number(upAng3.toFixed(2));
                              items[12]['rightDragDownAngle'] = items[12]['rightDragDownAngle'].toString().includes(".") ? (+items[12]['rightDragDownAngle'] - 1).toFixed(2) : +items[12]['rightDragDownAngle'] - 1;
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 14:
                          //更新数据
                          items[13]['leftDragDownHorAngle'] = items[13]['leftDragDownHorAngle'].toString().includes(".") ? (+items[13]['leftDragDownHorAngle'] - 1).toFixed(2) : +items[13]['leftDragDownHorAngle'] - 1;
                          break;
                      case 16:
                          items[15]['rightDragDownHorAngle'] = items[15]['rightDragDownHorAngle'].toString().includes(".") ? (+items[15]['rightDragDownHorAngle'] - 1).toFixed(2) : +items[15]['rightDragDownHorAngle'] - 1;
                          break;
                      case 17:
                          if (!this.state.checked) {
                              items[16]['leftRunAngle'] = items[16]['leftRunAngle'].toString().includes(".") ? (+items[16]['leftRunAngle'] - 1).toFixed(2) : +items[16]['leftRunAngle'] - 1;
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 19:
                          if (!this.state.checked) {
                              items[18]['rightRunAngle'] = items[18]['rightRunAngle'].toString().includes(".") ? (+items[18]['rightRunAngle'] - 1).toFixed(2) : +items[18]['rightRunAngle'] - 1;
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      default:
                  }
              }
          } else if (type === 'add') {
              if ((index === 2 || index === 4) && this.state.depth) {
                  if (!this.state.checked) {
                      let ang1 = this.konwDepthGetAngle((items[1]['leftDragDepth'] + 1)) * 180 / Math.PI;
                      let ang2 = this.konwDepthGetAngle((items[3]['rightDragDepth'] + 1)) * 180 / Math.PI;
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              if(items[1]['leftDragDepth'].toString().includes(".")) {
                                item[tempL] = (+items[1]['leftDragDepth'] + 1).toFixed(2);
                              } else {
                                item[tempL] = +items[1]['leftDragDepth'] + 1;
                              }
                          } else if (item.hasOwnProperty(tempR)) {
                              if(items[3]['rightDragDepth'].toString().includes(".")) {
                                item[tempR] = (+items[3]['rightDragDepth'] + 1).toFixed(2);
                              } else {
                                item[tempR] = +items[3]['rightDragDepth'] + 1;
                              }                             
                          } else if (item.hasOwnProperty('leftDragUpAngle')) {
                              item['leftDragUpAngle'] = Number((90 - ang1).toFixed(2))
                          } else if (item.hasOwnProperty('rightDragUpAngle')) {
                              item['rightDragUpAngle'] = Number((90 - ang2).toFixed(2))
                          } else if (item.hasOwnProperty('leftDragDownAngle')) {
                              item['leftDragDownAngle'] = Number((90 - ang1).toFixed(2))
                          } else if (item.hasOwnProperty('rightDragDownAngle')) {
                              item['rightDragDownAngle'] = Number((90 - ang2).toFixed(2))
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else if ((index === 5 || index === 7) && this.state.upControlLength) {
                  if (!this.state.checked) {
                      // debugger
                      let length = this.props.dragLength;
                      //获取角度
                      let ang1 = this.changeAngleGetAngle(2, (items[4]['leftDragUpAngle'] + 1) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                      let ang2 = this.changeAngleGetAngle(2, (items[6]['rightDragUpAngle'] + 1) * Math.PI / 180, length.rightUpLength, length.rightDownLength, items[3]['rightDragDepth']);
                      let downAng1 = (Math.asin(ang1) * 180 / Math.PI);
                      let downAng2 = (Math.asin(ang2) * 180 / Math.PI);
                      // debugger
                      //更新数据
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              if(items[4]['leftDragUpAngle'].toString().includes(".")) {
                                item[tempL] = (+items[4]['leftDragUpAngle'] + 1).toFixed(2);
                              } else {
                                item[tempL] = +items[4]['leftDragUpAngle'] + 1;
                              }
                          } else if (item.hasOwnProperty(tempR)) {
                              if(items[6]['rightDragUpAngle'].toString().includes(".")) {
                                item[tempR] = (+items[6]['rightDragUpAngle'] + 1).toFixed(2);
                              } else {
                                item[tempR] = +items[6]['rightDragUpAngle'] + 1;
                              }
                          } else if (item.hasOwnProperty('leftDragDownAngle')) {
                              item['leftDragDownAngle'] = Number(downAng1.toFixed(2))
                          } else if (item.hasOwnProperty('rightDragDownAngle')) {
                              item['rightDragDownAngle'] = Number(downAng2.toFixed(2))
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else if ((index === 8 || index === 10) && this.state.upHorControlLength) {
                  //更新数据
                  items.forEach(item => {
                      if (item.hasOwnProperty(tempL)) {
                          if(items[7]['leftDragUpHorAngle'].toString().includes(".")) {
                            item[tempL] = (+items[7]['leftDragUpHorAngle'] + 1).toFixed(2);
                          } else {
                            item[tempL] = items[7]['leftDragUpHorAngle'] + 1;
                          }
                      } else if (item.hasOwnProperty(tempR)) {
                          if(items[9]['rightDragUpHorAngle'].toString().includes(".")) {
                            item[tempR] = (+items[9]['rightDragUpHorAngle'] + 1).toFixed(2);
                          } else {
                            item[tempR] = +items[9]['rightDragUpHorAngle'] + 1;
                          }
                      }
                  });
              } else if ((index === 11 || index === 13) && this.state.downControlLength) {
                  if (!this.state.checked) {
                      let length = this.props.dragLength;
                      //获取角度
                      let ang1 = this.changeAngleGetAngle(1, (items[10]['leftDragDownAngle'] + 1) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                      let ang2 = this.changeAngleGetAngle(1, (items[12]['rightDragDownAngle'] + 1) * Math.PI / 180, length.rightUpLength, length.rightDownLength, items[3]['rightDragDepth']);
                      let upAng1 = (Math.asin(ang1) * 180 / Math.PI);
                      let upAng2 = (Math.asin(ang2) * 180 / Math.PI);
                      //更新数据
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              if(items[10]['leftDragDownAngle'].toString().includes(".")) {
                                item[tempL] = (+items[10]['leftDragDownAngle'] + 1).toFixed(2);
                              } else {
                                item[tempL] = +items[10]['leftDragDownAngle'] + 1;
                              }
                          } else if (item.hasOwnProperty(tempR)) {
                              if(items[12]['rightDragDownAngle'].toString().includes(".")) {
                                item[tempR] = (+items[12]['rightDragDownAngle'] + 1).toFixed(2);
                              } else {
                                item[tempR] = +items[12]['rightDragDownAngle'] + 1;
                              }
                          } else if (item.hasOwnProperty('leftDragUpAngle')) {
                              item['leftDragUpAngle'] = Number(upAng1.toFixed(2));
                          } else if (item.hasOwnProperty('rightDragUpAngle')) {
                              item['rightDragUpAngle'] = Number(upAng2.toFixed(2));
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else if ((index === 14 || index === 16) && this.state.downHorControlLength) {
                  //更新数据
                  items.forEach(item => {
                      if (item.hasOwnProperty(tempL)) {
                          if(items[13]['leftDragDownHorAngle'].toString().includes(".")) {
                            item[tempL] = (+items[13]['leftDragDownHorAngle'] + 1).toFixed(2);
                          } else {
                            item[tempL] = +items[13]['leftDragDownHorAngle'] + 1;
                          }
                      } else if (item.hasOwnProperty(tempR)) {
                          if(items[15]['rightDragDownHorAngle'].toString().includes(".")) {
                            item[tempR] = (+items[15]['rightDragDownHorAngle'] + 1).toFixed(2);
                          } else {
                            item[tempR] = +items[15]['rightDragDownHorAngle'] + 1
                          }
                      }
                  });
              } else if ((index === 17 || index === 19) && this.state.downhead) {
                  if (!this.state.checked) {
                      items.forEach(item => {
                          if (item.hasOwnProperty(tempL)) {
                              if(items[16]['leftRunAngle'].toString().includes(".")) {
                                item[tempL] = (+items[16]['leftRunAngle'] + 1).toFixed(2);
                              } else {
                                item[tempL] = +items[16]['leftRunAngle'] + 1;
                              }
                          } else if (item.hasOwnProperty(tempR)) {
                              if(items[18]['rightRunAngle'].toString().includes(".")) {
                                item[tempR] = (+items[18]['rightRunAngle'] + 1).toFixed(2)
                              } else {
                                item[tempR] = +items[18]['rightRunAngle'] + 1
                              }
                          }
                      });
                  } else {
                      message.warning("当前为最佳状态")
                  }
              } else {
                  let angleftDep = this.konwDepthGetAngle((items[1]['leftDragDepth'] + 1)) * 180 / Math.PI;
                  let angrightDep = this.konwDepthGetAngle((items[3]['rightDragDepth'] + 1)) * 180 / Math.PI;
                  let length = this.props.dragLength;
                  switch (index) {
                      case 2:
                          if (!this.state.checked) {
                              if(items[1]['leftDragDepth'].toString().includes(".")) {
                                items[1]['leftDragDepth'] = (+items[1]['leftDragDepth'] + 1).toFixed(2);
                              } else {
                                items[1]['leftDragDepth'] = +items[1]['leftDragDepth'] + 1;
                              };
                              items[4]['leftDragUpAngle'] = Number((90 - angleftDep).toFixed(2));
                              items[10]['leftDragDownAngle'] = Number((90 - angleftDep).toFixed(2));
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 4:
                          if (!this.state.checked) {
                              if(items[3]['rightDragDepth'].toString().includes(".")) {
                                items[3]['rightDragDepth'] = (+items[3]['rightDragDepth'] + 1).toFixed(2);
                              } else {
                                items[3]['rightDragDepth'] = +items[3]['rightDragDepth'] + 1;
                              }
                              items[6]['rightDragUpAngle'] = Number((90 - angrightDep).toFixed(2));
                              items[12]['rightDragDownAngle'] = Number((90 - angrightDep).toFixed(2));
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 5:
                          if (!this.state.checked) {
                              //获取角度
                              let angLeftUp = this.changeAngleGetAngle(2, (items[4]['leftDragUpAngle'] + 1) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
  
                              let downAng = (Math.asin(angLeftUp) * 180 / Math.PI);
                              //更新数据
                              if(items[4]['leftDragUpAngle'].toString().includes(".")) {
                                items[4]['leftDragUpAngle'] = (+items[4]['leftDragUpAngle'] + 1).toFixed(2);
                              } else {
                                items[4]['leftDragUpAngle'] = +items[4]['leftDragUpAngle'] + 1;
                              }
                              items[10]['leftDragDownAngle'] = Number(downAng.toFixed(2));
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 7:
                          if (!this.state.checked) {
                              //获取角度
                              let angRightUp = this.changeAngleGetAngle(2, (items[6]['rightDragUpAngle'] + 1) * Math.PI / 180, length.rightUpLength, length.rightDownLength, items[3]['rightDragDepth']);
                              let downAng1 = (Math.asin(angRightUp) * 180 / Math.PI);
                              if(items[6]['rightDragUpAngle'].toString().includes(".")) {
                                items[6]['rightDragUpAngle'] = (+items[6]['rightDragUpAngle'] + 1).toFixed(2);
                              } else {
                                items[6]['rightDragUpAngle'] = +items[6]['rightDragUpAngle'] + 1;
                              }
                              items[12]['rightDragDownAngle'] = Number(downAng1.toFixed(2));
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 8:
                          //更新数据
                          if(items[7]['leftDragUpHorAngle'].toString().includes(".")) {
                            items[7]['leftDragUpHorAngle'] = (+items[7]['leftDragUpHorAngle'] + 1).toFixed(2);
                          } else {
                            items[7]['leftDragUpHorAngle'] = +items[7]['leftDragUpHorAngle'] + 1;
                          }
                          break;
                      case 10:
                          if(items[9]['rightDragUpHorAngle'].toString().includes(".")) {
                            items[9]['rightDragUpHorAngle'] = (+items[9]['rightDragUpHorAngle'] + 1).toFixed(2);
                          } else {
                            items[9]['rightDragUpHorAngle'] = +items[9]['rightDragUpHorAngle'] + 1;
                          }
                          break;
                      case 11:
                          if (!this.state.checked) {
                              let ang2 = this.changeAngleGetAngle(1, (items[10]['leftDragDownAngle'] + 1) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                              let upAng2 = (Math.asin(ang2) * 180 / Math.PI);
                              //更新数据
                              items[4]['leftDragUpAngle'] = Number(upAng2.toFixed(2));
                              if(items[10]['leftDragDownAngle'].toString().includes(".")) {
                                items[10]['leftDragDownAngle'] = (+items[10]['leftDragDownAngle'] + 1).toFixed(2);
                              } else {
                                items[10]['leftDragDownAngle'] = +items[10]['leftDragDownAngle'] + 1;
                              }
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 13:
                          if (!this.state.checked) {
                              let ang3 = this.changeAngleGetAngle(1, (items[12]['rightDragDownAngle'] + 1) * Math.PI / 180, length.leftUpLength, length.leftDownLength, items[1]['leftDragDepth']);
                              let upAng3 = (Math.asin(ang3) * 180 / Math.PI);
                              items[6]['rightDragUpAngle'] = Number(upAng3.toFixed(2));
                              if(items[12]['rightDragDownAngle'].toString().includes(".")) {
                                items[12]['rightDragDownAngle'] = (+items[12]['rightDragDownAngle'] + 1).toFixed(2);
                              } else {
                                items[12]['rightDragDownAngle'] = +items[12]['rightDragDownAngle'] + 1;
                              }
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 14:
                          //更新数据
                          if(items[13]['leftDragDownHorAngle'].toString().includes(".")) {
                            items[13]['leftDragDownHorAngle'] = (+items[13]['leftDragDownHorAngle'] + 1).toFixed(2);
                          } else {
                            items[13]['leftDragDownHorAngle'] = +items[13]['leftDragDownHorAngle'] + 1;
                          }
                          break;
                      case 16:
                          if(items[15]['rightDragDownHorAngle'].toString().includes(".")) {
                            items[15]['rightDragDownHorAngle'] = (+items[15]['rightDragDownHorAngle'] + 1).toFixed(2);
                          } else {
                            items[15]['rightDragDownHorAngle'] = +items[15]['rightDragDownHorAngle'] + 1;
                          }
                          break;
                      case 17:
                          if (!this.state.checked) {
                              if(items[16]['leftRunAngle'].toString().includes(".")) {
                                items[16]['leftRunAngle'] = (+items[16]['leftRunAngle'] + 1).toFixed(2);
                              } else {
                                items[16]['leftRunAngle'] = +items[16]['leftRunAngle'] + 1;
                              }
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      case 19:
                          if (!this.state.checked) {
                             if(items[18]['rightRunAngle'].toString().includes(".")) {
                                items[18]['rightRunAngle'] = (+items[18]['rightRunAngle'] + 1).toFixed(2);
                             } else {
                                items[18]['rightRunAngle'] = +items[18]['rightRunAngle'] + 1;
                             }
                          } else {
                              message.warning("当前为最佳状态")
                          }
                          break;
                      default:
                  }
              }
          }
          store.dispatch({
              type: 'DEPTHDATA',
              data: items
          })
          this.setState({
              data: items
          }, () => {
              this.getOverallEvaluation()
              runRank(items)
          })
      }
    /**
     * 根据挖深算出上耙角度
     * @param {*} depth 当前挖深
     */
    konwDepthGetAngle(depth) {
        let sysData = JSON.parse(JSON.stringify(this.state.sysData));
        let ang = Math.acos(depth / (sysData.leftUpLength + sysData.leftDownLength + 5.33585));
        return ang;
    }

    getDepth(upAngle, downAngle) {
        let sysData = JSON.parse(JSON.stringify(this.state.sysData));
        let dep = Math.sin(upAngle * Math.PI / 180) * sysData.leftUpLength + Math.sin(downAngle * Math.PI / 180) * (sysData.leftDownLength + 5.33585);
        return dep;
    }

    /**
     * 根据挖深设置上耙或者下耙算出下耙或者上耙对应的角度
     * @param {*} type 1？获取下耙对应角度:上耙对应角度
     * @param {*} ang 当前耙设置角度值
     * @param {*} L1 上耙长度
     * @param {*} L2 下耙长度
     * @param {*} depth 当前挖深
     */
    changeAngleGetAngle(type, ang, L1, L2, depth) {
        let angle;
        angle = type === 1 ? (depth - Math.sin(ang) * L1) / (L2 + 5.33585) : (depth - Math.sin(ang) * (L2 + 5.33585)) / L1;
        return angle;
    }

    /**
     * 控制是否关联控制
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
        } else if (type === 'down') {
            this.setState({
                downControlLength: !this.state.downControlLength
            })
        } else if (type === 'downHor') {
            this.setState({
                downHorControlLength: !this.state.downHorControlLength
            })
        } else if (type === 'depth') {
            this.setState({
                depth: !this.state.depth
            })
        } else if (type === 'downhead') {
            this.setState({
                downhead: !this.state.downhead
            })
        }
    }

    getOverallEvaluation() {
        let limitData = this.state.limitData;
        let items = this.state.data;
        let arr = [];
        arr.push({id: 1, name: '耙臂角度/最佳角度【范围】', child: []})
        arr[0].child.push({
            id: 1,
            title: '上耙管',
            key: '左',
            vert: items[4]['leftDragUpAngle'],
            verGood: limitData[0].good,
            verMin: limitData[0].min,
            verMax: limitData[0].max,
            onlyField: 1
            // hor: items[7]['leftDragUpHorAngle'],
            // horGood: limitData[1].good,
            // horMin: limitData[1].min,
            // horMax: limitData[1].max
        })
        arr[0].child.push({
            id: 2,
            title: '上耙管',
            key: '右',
            vert: items[6]['rightDragUpAngle'],
            verGood: limitData[0].good,
            verMin: limitData[0].min,
            verMax: limitData[0].max,
            onlyField: 1
            // hor: items[9]['rightDragUpHorAngle'],
            // horGood: limitData[1].good,
            // horMin: limitData[1].min,
            // horMax: limitData[1].max
        })
        arr[0].child.push({
            id: 3,
            title: '下耙管',
            key: '左',
            vert: items[10]['leftDragDownAngle'],
            verGood: limitData[2].good,
            verMin: limitData[2].min,
            verMax: limitData[2].max,
            onlyField: 1
            // hor: items[13]['leftDragDownHorAngle'],
            // horGood: limitData[3].good,
            // horMin: limitData[3].min,
            // horMax: limitData[3].max
        })
        arr[0].child.push({
            id: 4,
            title: '下耙管',
            key: '右',
            vert: items[12]['rightDragDownAngle'],
            verGood: limitData[2].good,
            verMin: limitData[2].min,
            verMax: limitData[2].max,
            onlyField: 1
            // hor: items[15]['rightDragDownHorAngle'],
            // horGood: limitData[3].good,
            // horMin: limitData[3].min,
            // horMax: limitData[3].max
        })
        arr.push({id: 2, name: '耙管安全夹角/最佳角度【范围】', child: []})
        arr[1].child.push({
            id: 1,
            title: '耙管',
            key: '左',
            vert: items[16]['leftRunAngle'],
            verGood: limitData[5].good,
            verMin: limitData[5].min,
            verMax: limitData[5].max,
            onlyField: 2
        })
        arr[1].child.push({
            id: 2,
            title: '耙管',
            key: '右',
            vert: items[18]['rightRunAngle'],
            verGood: limitData[5].good,
            verMin: limitData[5].min,
            verMax: limitData[5].max,
            onlyField: 2
        });
        arr.push({id: 3, name: '耙臂挖深/最佳挖深【范围】', child: []})
        let minOrMaxLeft;
        if(+items[1]['leftDragDepth'] < limitData[6].min) {
            minOrMaxLeft = "浅"
        } else if(items[1]['leftDragDepth'] > limitData[6].max) {
            minOrMaxLeft = "深"
        }
        arr[2].child.push({
            id: 1,
            title: '耙挖深',
            key: '左',
            vert: items[1]['leftDragDepth'],
            verGood: limitData[6].good,
            verMin: limitData[6].min,
            verMax: limitData[6].max,
            onlyField: 3,
            minOrMax: minOrMaxLeft
        });
        let minOrMaxRight;
        if(+items[3]['rightDragDepth'] < limitData[6].min) {
            minOrMaxRight = "浅"
        } else if(items[3]['rightDragDepth'] > limitData[6].max) {
            minOrMaxRight = "深"
        }
        arr[2].child.push({
            id: 2,
            title: '耙挖深',
            key: '右',
            vert: items[3]['rightDragDepth'],
            verGood: limitData[6].good,
            verMin: limitData[6].min,
            verMax: limitData[6].max,
            onlyField: 3,
            minOrMax: minOrMaxRight
        });   
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
            displayOverallEvaluation: copyArr
        }, () => {
            this.getGuidance();
            this.setShipInfo();
        })
    }

    setShipInfo() {
        console.log(this.props.depthData)
        let items = this.props.depthData
        // items.forEach(e => {
        //     this.setShipParams(e.id, e, null, e.attrName)
        // })
    }

    getGuidance() {
        let temp = JSON.parse(JSON.stringify(this.state.overallEvaluation));
        let allNice = true;
        for (let i = 0; i < temp.length; i++) {
            let oneNice = true;
            let twoNice = true;
            let which = true;
            for (let j = 0; j < temp[i].child.length; j++) {
                if (temp[i].child[j].hor !== undefined) {
                    if (temp[i].child[j].vert >= temp[i].child[j].verMin && temp[i].child[j].vert < temp[i].child[j].verMax) {
                        temp[i].child[j]['verNice'] = true;
                    } else {
                        allNice = false;
                        oneNice = false;
                        temp[i].child[j]['verNice'] = false;
                    }
                    if (temp[i].child[j].hor >= temp[i].child[j].horMin && temp[i].child[j].hor < temp[i].child[j].horMax) {
                        temp[i].child[j]['horNice'] = true;
                    } else {
                        allNice = false;
                        oneNice = false;
                        temp[i].child[j]['horNice'] = false;
                    }
                } else {
                    which = false;
                    if (temp[i].child[j].vert >= temp[i].child[j].verMin && temp[i].child[j].vert < temp[i].child[j].verMax) {
                        temp[i].child[j]['verNice'] = true;
                    } else {
                        allNice = false;
                        twoNice = false;
                        temp[i].child[j]['verNice'] = false;
                    }
                }
            }
            if (!twoNice) {
                temp[i]['twoNice'] = false;
            } else {
                temp[i]['twoNice'] = true;
            }
            if (!oneNice) {
                temp[i]['oneNice'] = false;
            } else {
                temp[i]['oneNice'] = true;
            }
            if (which) {
                temp[i]['which'] = true;
            } else {
                temp[i]['which'] = false;
            }
        }
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

    changeDisplayStatue(e, data, overallEvaluation, guidance) {
        console.log(data);
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
            let leftOrRight = type == '左耙' ? "左耙" : "右耙";
            this.setState({
                displayData: tempData,
                upControlLength: false,
                downControlLength: false,
                upHorControlLength: false,
                downHorControlLength: false,
                downhead: false,
                depth: false,
                displayOverallEvaluation: appraise,
                displayGuidance: instruction,
                leftOrRight: leftOrRight
            })
        } else if (type === '双耙') {
            this.setState({
                displayData: data,
                upControlLength: true,
                downControlLength: true,
                upHorControlLength: true,
                downHorControlLength: true,
                downhead: true,
                depth: true,
                displayOverallEvaluation: overallEvaluation,
                displayGuidance: guidance,
                leftOrRight: "双耙"
            })
        }
    }

    render() {
        const {data, displayData, limitData, overallEvaluation, guidance} = this.state;
        // console.log(displayData);
        // console.log(limitData)
        return (
            <div>
                <p>参数输入</p>
                <select name="3"
                        id="statusSelect"
                        onChange={(e) => this.changeDisplayStatue(e, data, overallEvaluation, guidance)}
                >
                    <option className='title-name' key='1'>双耙</option>
                    <option className='title-name' key='2'>左耙</option>
                    <option className='title-name' key='3'>右耙</option>
                </select>
                <ul className="upControlLink">
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
                                        item.reName === "upHor" ? <>{
                                            this.state.upHorControlLength === true ? <LinkOutlined onClick={() => {
                                                this.lengthControl('upHor')
                                            }}/> : <DisconnectOutlined onClick={() => {
                                                this.lengthControl('upHor')
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
                                        item.reName === "downHor" ? <>{
                                            this.state.downHorControlLength === true ? <LinkOutlined onClick={() => {
                                                this.lengthControl('downHor')
                                            }}/> : <DisconnectOutlined onClick={() => {
                                                this.lengthControl('downHor')
                                            }}/>
                                        }</> : null
                                    }
                                    {
                                        item.reName === "depth" ? <>{
                                            this.state.depth === true ? <LinkOutlined onClick={() => {
                                                this.lengthControl('depth')
                                            }}/> : <DisconnectOutlined onClick={() => {
                                                this.lengthControl('depth')
                                            }}/>
                                        }</> : null
                                    }
                                    {
                                        item.reName === "downhead" ? <>{
                                            this.state.downhead === true ? <LinkOutlined onClick={() => {
                                                this.lengthControl('downhead')
                                            }}/> : <DisconnectOutlined onClick={() => {
                                                this.lengthControl('downhead')
                                            }}/>
                                        }</> : null
                                    }
                                </li> :
                                <li key={index}>
                                    {
                                        item.hasCheck ? <Checkbox onChange={this.onChange}></Checkbox> : <i></i>
                                    }
                                    {
                                        item.unit !== '' ?
                                            <>
                                                <span>{item.val}:</span>
                                                <span className="degree">{item.unit}</span>
                                                <div className="editValue">
                                                    <span
                                                        onClick={(e) => this.setShipParams(item.id, null, 'reduce', item.attrName)}>-</span>
                                                    <input type="text" value={item[item.reName]}
                                                           onChange={(e) => this.setShipParams(item.id, e, null, item.attrName)}/>
                                                    <span
                                                        onClick={(e) => this.setShipParams(item.id, null, 'add', item.attrName)}>+</span>
                                                </div>
                                            </>
                                            :
                                            <>
                                                <span>{item.val}</span>
                                            </>
                                    }
                                </li>
                                
                            //     <li key={index}>
                            //         <i></i>
                            //         <span>{item.val}</span>
                            //         <span className="degree">{item.unit}</span>
                            //         <div className="editValue">
                            //             <span
                            //                 onClick={(e) => this.setShipParams(item.id, null, 'reduce', item.attrName)}>-</span>
                            //             <input type="text" value={item[item.reName]}
                            //                    onChange={(e) => this.setShipParams(item.id, e, null, item.attrName)}/>
                            //             <span
                            //                 onClick={(e) => this.setShipParams(item.id, null, 'add', item.attrName)}>+</span>
                            //         </div>
                            //    </li>
                        ))
                    }

                </ul>
                <p>总体评价</p>
                <div className="comment">
                    <ul>
                        {
                            this.state.displayOverallEvaluation.map((item, index) => (
                                <li key={item.id}>
                                    {item.id}、{item.name}
                                    {
                                        item.child.map((ite, id) => (
                                            <ul key={id}>
                                                <li>
                                                    <p>{ite.key}&nbsp;{ite.title}</p>
                                                       {
                                                        ite.onlyField === 1 ?
                                                        <div className="comment_item_ang">
                                                        <div>
                                                            <span>垂直角度:{ite.vert}</span>
                                                            <span>最佳值:{ite.verGood}</span>
                                                            <span>范围:[{ite.verMin}-{ite.verMax}]</span>
                                                        </div>
                                                    </div> : null
                                                    }
                                                    {
                                                        ite.onlyField === 2 ?
                                                        <div className="comment_item_ang">
                                                        <div>
                                                            <span>安全夹角:{ite.vert}</span>
                                                            <span>最佳值:{ite.verGood}</span>
                                                            <span>范围:[{ite.verMin}-{ite.verMax}]</span>
                                                        </div>
                                                        </div> : null
                                                    }
                                                    {
                                                        ite.onlyField === 3 ?
                                                        <div className="comment_item_ang">
                                                        <div>
                                                            <span>挖深:{ite.vert}</span>
                                                            <span>最佳值:{ite.verGood}</span>
                                                            <span>范围:[{ite.verMin}-{ite.verMax}]</span>
                                                        </div>
                                                        </div> : null
                                                    }
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
                                                                                    ite.onlyField === 1 ? <p>{ite.key}{ite.title}垂直角度为{ite.vert},不在[{ite.verMin}-{ite.verMax}]范围内，需调整</p> : null
                                                                                }
                                                                                {
                                                                                    ite.onlyField === 2 ?  <p>{ite.key}{ite.title}安全夹角为{ite.vert},不在[{ite.verMin}-{ite.verMax}]范围内，需调整</p> : null
                                                                                }
                                                                                {
                                                                                    ite.onlyField === 3 ?  <p>{ite.key}{ite.title}挖深为{ite.vert},不在[{ite.verMin}-{ite.verMax}]范围内，需调整</p> : null
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
                                                                                    ite.onlyField === 1 ? <p>{ite.key}{ite.title}垂直角度为{ite.vert},不在[{ite.verMin}-{ite.verMax}]范围内，需调整</p> : null
                                                                                }
                                                                                {
                                                                                    ite.onlyField === 2 ?  <p>{ite.key}{ite.title}安全夹角为{ite.vert},不在[{ite.verMin}-{ite.verMax}]范围内，需调整</p> : null
                                                                                }
                                                                                {
                                                                                    ite.onlyField === 3 ?  <>
                                                                                        {
                                                                                         ite.minOrMax === undefined ? null : <p>{ite.key}{ite.title}建议安装{ite.minOrMax}挖管</p>
                                                                                        }
                                                                                        </> : null
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

    onChange = e => {
        let limitData = this.state.limitData;
        console.log(e.target.checked);
        this.setState({
            checked: e.target.checked,
        });
        if (e.target.checked) {
            // let items = JSON.parse(JSON.stringify(this.state.data));
            let items = this.state.data;
            items[1]['leftDragDepth'] = this.getDepth(limitData[0].good, limitData[2].good).toFixed(2)
            items[3]['rightDragDepth'] = this.getDepth(limitData[0].good, limitData[2].good).toFixed(2)
            items[4]['leftDragUpAngle'] = limitData[0].good;
            items[6]['rightDragUpAngle'] = limitData[0].good;
            items[10]['leftDragDownAngle'] = limitData[2].good;
            items[12]['rightDragDownAngle'] = limitData[2].good;
            items[16]['leftRunAngle'] = limitData[4].good;
            items[18]['rightRunAngle'] = limitData[4].good;
            actionArmUp(0, '左', limitData[0].good * Math.PI / 180, -(items[7]['leftDragUpHorAngle']) * Math.PI / 180);
            actionArmUp(0, '右', limitData[0].good * Math.PI / 180, (items[9]['rightDragUpHorAngle']) * Math.PI / 180);
            //钱鑫：耙角度
            actionArmDown(0, '左', (limitData[2].good - limitData[0].good) * Math.PI / 180, -items[13]['leftDragDownHorAngle'] * Math.PI / 180);
            actionArmDown(0, '右', (limitData[2].good - limitData[0].good) * Math.PI / 180, items[15]['rightDragDownHorAngle'] * Math.PI / 180);
            // actionArmDown(0, '左', (limitData[2].good) * Math.PI / 180, -items[13]['leftDragDownHorAngle'] * Math.PI / 180);
            // actionArmDown(0, '右', (limitData[2].good) * Math.PI / 180, items[15]['rightDragDownHorAngle'] * Math.PI / 180);
            targetHeadArm('左', limitData[4].good * Math.PI / 180);
            targetHeadArm('右', limitData[4].good * Math.PI / 180);
            this.setState({
                data: items
            }, () => {
                this.getOverallEvaluation()
            })
        }
    };
}

function mapStateToProps(state) {
    return {
        dragLength: state.dragLength,
        depthData: state.depthData
    }
}

export default connect(mapStateToProps)(RightWinWrapPairUp);
