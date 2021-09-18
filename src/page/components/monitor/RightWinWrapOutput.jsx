import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Select } from 'antd';
const { Option } = Select;
class RightWinWrapOutput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      freeData: this.props.freeData,
      depthData:this.props.depthData,
      freeControl: 0,
      leftUpL: 0,
      rightUpL: 0,
      leftDownL: 0,
      rightDownL: 0
    }
  }
  componentDidMount() {
    if (this.props.monitorType === 1) {
      this.inpPara()
    } else if (this.props.monitorType === 2) {
      this.depthInpPara()
    }

  }
  getDepth(key = '左', type = 1, upAngle, downAngle) {
    let dragLength = this.props.dragLength;
    let dep;
    if (key === '左') {
      if (type === 1) {
        dep = Math.sin(upAngle * Math.PI / 180) * dragLength.leftUpLength;
      } else {
        dep = Math.sin(upAngle * Math.PI / 180) * (dragLength.leftDownLength + 5.33585)
      }
    } else {
      if (type === 1) {
        dep = Math.sin(upAngle * Math.PI / 180) * dragLength.rightUpLength;
      } else {
        dep = Math.sin(upAngle * Math.PI / 180) * (dragLength.rightDownLength + 5.33585)
      }
    }


    return dep;
  }
  depthInpPara() {
    let _data = JSON.parse(JSON.stringify(this.state.depthData));
    this.setState({
      leftUpL: Number(this.getDepth('左', 1, _data[4].leftDragUpAngle).toFixed(2)),
      rightUpL: Number(this.getDepth('右', 1, _data[6].rightDragUpAngle).toFixed(2)),
      leftDownL: Number(this.getDepth('左', 2, _data[10].leftDragDownAngle).toFixed(2)),
      rightDownL: Number(this.getDepth('右', 2, _data[12].rightDragDownAngle).toFixed(2)),
    })
    for (let _id = _data.length; _id > 0; _id--) {
      if ((_data[_id-1].link === true || _data[_id-1].unit !=='度')) {
        _data.splice(_id-1,1)
      }
    }
    this.setState({
      depthData: _data
    })
  }
  inpPara() {
    let _data = JSON.parse(JSON.stringify(this.state.freeData));
    this.setState({
      leftUpL: Number(this.getDepth('左', 1, _data[0].leftDragUpAngle).toFixed(2)),
      rightUpL: Number(this.getDepth('右', 1, _data[2].rightDragUpAngle).toFixed(2)),
      leftDownL: Number(this.getDepth('左', 2, _data[6].leftDragDownAngle).toFixed(2)),
      rightDownL: Number(this.getDepth('右', 2, _data[8].rightDragDownAngle).toFixed(2)),
    })
    for (let _id = _data.length; _id > 0; _id--) {
      if (_data[_id-1].attrName) {
        let attrName = _data[_id-1].attrName.split(',');
        let tempAttr = attrName[0];
        _data[_id-1].attrName = tempAttr;
      }else{
        _data.splice(_id-1,1)
      }
    }
    this.setState({
      freeData: _data
    })
  }
  render() {
    const { monitorType } = this.props;
    return (
      <div className="paramsOutput">
        <div className="paramsOutput_head">
          <Select
            defaultValue="计算过程"
          >
            <Option value="计算过程">计算过程</Option>
          </Select>
        </div>
        <div className="paramsOutput_content">
          <ul className="inpPara">
            {
              monitorType === 1 ? <>
                {this.state.freeData.map((item, index) => (
                  item.attrName !== undefined ? <li key={item.id}>
                    <span className="icon">
                      {index+1}、{item.val}:
                              </span>
                    <span>{item[item.attrName]}</span>
                    <span>{item.range}</span>
                  </li> : null

                ))}

              </> :
                <>
                  {this.state.depthData.map((item, index) => (
                     <li key={item.id}>
                      <span className="icon">
                        {index+1}、{item.val}:
                              </span>
                      <span>{item[item.reName]}</span>
                    </li>

                  ))}

                </>
            }


          </ul>
        <ul>
          <li className="alaData">
            <span>1、根据左、右上下耙的垂直水平角度，判断它是否在所范围内</span>
          </li>
          <li className="alaData">
            <span>2、根据左上耙的垂直角度以及左上耙的长度，得到左上耙竖直长度:
                              {this.state.leftUpL}
            </span>
          </li>
          <li className="alaData">
            <span>3、根据右上耙的垂直角度以及右上耙的长度，得到右上耙竖直长度:
                              {
                this.state.rightUpL
              }
            </span>
          </li>
          <li className="alaData">
            <span>4、根据左下耙的垂直角度和左下耙的长度以及耙头长度，得到左下耙竖直长度:
                              {
                this.state.leftDownL
              }
            </span>
          </li>
          <li className="alaData">
            <span>5、根据右下耙的垂直角度和右下耙的长度以及耙头长度，得到右下耙竖直长度:
                              {
                this.state.rightDownL
              }
            </span>
          </li>
          <li className="alaData">
            <span>6、根据左上下耙的竖直距离，
            得到距离左吸口的竖直距离为:
                              {
                this.state.leftUpL + this.state.leftDownL
              }
            </span>
          </li>
          <li className="alaData">
            <span>7、根据右上下耙的竖直距离，
            得到距离右吸口的竖直距离为:
                              {
                this.state.rightUpL + this.state.rightDownL
              }
            </span>
          </li>
        </ul>
      </div>
      </div >
    )
  }
}
function mapStateToProps(state) {
  return {
    freeData: state.freeData,
    dragLength: state.dragLength,
    monitorType: state.monitorType,
    depthData: state.depthData
  }
}
export default connect(mapStateToProps)(RightWinWrapOutput);