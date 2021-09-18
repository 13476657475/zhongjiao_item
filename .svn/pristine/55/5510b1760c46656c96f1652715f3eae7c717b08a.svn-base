import React, { Component } from 'react';
import { InputNumber, Select } from 'antd';

import { initScene, stopScene } from './scene';
import { initEditor, stopEditor } from './editor';
import { initThreeLandScene } from './land/scene';

import { defineFunction, transformSetMode, transformBySetPosition, transformBySetSpacing, selectDeviceByIndex } from './editor/ctrl'

import './index.less';

const { Option } = Select;

class Object3d extends Component {

    constructor(props) {
        super(props);
        this.state = {
            btnText: '旋转',

            selects: [],
            select_text: '选择设备',

            row1: [0, 0, 0],
            rowDisabled_1: [true, true, true],

            row2: [0, 0],
            rowDisabled_2: [true, true],
            maxHieght:0
        }
    }

    // 初始化
    componentDidMount() {
        this.setState({
            maxHieght:document.body.clientHeight
        })
        window.addEventListener('resize',this.handleHeight);
        if (this.props.app === 'editor') {
            initEditor(this.mount,document.body.clientHeight-114);
            defineFunction.setPositionFun = this.setPositionInput; // 赋值设置位置input数据的回调
            defineFunction.setSpacingFun = this.setSpacingInput; // 赋值设置间距input数据的回调
            defineFunction.setDeviceSelectFun = this.setDeviceSelect; // 赋值设备下拉选择框
            defineFunction.setSelectTextFun = this.setSelectText; // 设置选择的设备
        } else if (this.props.app === 'land') {
            initThreeLandScene(this.mount,document.body.clientHeight-114);
        } else {
            initScene(this.mount,document.body.clientHeight-114)
        }
    }
    handleHeight = ()=>{
        let Height1 = document.body.clientHeight;
        console.log(Height1)
        this.setState({
            maxHieght:Height1
        })
    }

    switchTransform = () => {
        let text = this.state.btnText;
        transformSetMode(text);
        this.setState({
            btnText: text === '旋转' ? '移动' : '旋转',
        })

    }

    onChange = (i, v) => {
        let { row1 } = this.state;
        row1[i] = v;
        this.setState({ row1 });
        transformBySetPosition(i, v);
    }

    onChange2 = (i, v) => {
        let { row2 } = this.state;
        row2[i] = v;
        this.setState({ row2 });
        transformBySetSpacing(i, v);
    }

    setPositionInput = (row, disabled) => {
        this.setState({ row1: row, rowDisabled_1: disabled });
    }

    setSpacingInput = (row, disabled) => {
        this.setState({ row2: row, rowDisabled_2: disabled });
    }

    setDeviceSelect = (array, hasRemove) => {
        if (hasRemove) {
            this.setState({ selects: array, select_text: '选择设备' });
        } else {
            this.setState({ selects: array });
        }
    }

    setSelectText = (text) => {
        this.setState({ select_text: text });
    }

    changeSelectValue = (i) => {
        selectDeviceByIndex(i); // 选择设备
        this.setState({
            select_text: i
        })
    }

    render() {
        const { row1, rowDisabled_1, row2, rowDisabled_2, selects, select_text } = this.state;

        return (
            <div className='object-3d-view'
                ref={(mount) => { this.mount = mount }}
            >
                {
                    (this.props.app === 'editor')
                        ?
                        <>
                            <div className='float-wrap right-float-wrap'>
                                <div className='row'>
                                    <span className='row-title'>设备名称:</span>
                                    <Select value={select_text} style={{ width: 120 }} bordered={false} onChange={this.changeSelectValue}>
                                        {selects.map(d => (
                                            <Option key={d.v}>{d.t}</Option>
                                        ))}
                                    </Select>
                                </div>
                                <div className='row'>
                                    <span className='row-title'>位置:</span>
                                    <InputNumber size="small" disabled={rowDisabled_1[0]} value={row1[0]} step={0.01} onChange={v => { this.onChange(0, v) }} />
                                    <InputNumber size="small" disabled={rowDisabled_1[1]} value={row1[1]} step={0.01} onChange={v => { this.onChange(1, v) }} />
                                    <InputNumber size="small" disabled={rowDisabled_1[2]} value={row1[2]} step={0.01} onChange={v => { this.onChange(2, v) }} />
                                </div>
                                <div className='row'>
                                    <span className='row-title'>间距:</span>
                                    <InputNumber size="small" min={0} disabled={rowDisabled_2[0]} value={row2[0]} step={0.01} onChange={v => { this.onChange2(0, v) }} />
                                    <InputNumber size="small" min={0} disabled={rowDisabled_2[0]} value={row2[1]} step={0.01} onChange={v => { this.onChange2(1, v) }} />
                                </div>
                            </div>
                        </>
                        :
                        null
                }
            </div>
        )
    }
    

}

export default Object3d;
