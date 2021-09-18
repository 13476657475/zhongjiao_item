import React, {Component} from 'react';

import {message} from 'antd';

class LimitSet extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: this.props.data
        }
    }

    setShipParams = (index, e, type, str, typeInp) => {
        console.log(index);
        let items = this.state.data;
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
            if(Number(temp)) {
                console.log(items);
                items.forEach(item => {
                    if (item.attrName === str) {
                        if (typeInp === 'max' && (Number(e.target.value) <= Number(item['min'] + 1))) {
                            message.warning('最大值不能小于最小值')
                        } else if (typeInp === 'min' && (Number(item['max']) <= Number(e.target.value))) {
                            message.warning('最小值不能大于最大值')
                        } else {
                            item[typeInp] = e.target.value;
                        }
                    }
                });
            } else {
                items.forEach(item => {
                    if (item.attrName === str) {
                        item[typeInp] = e.target.value;
                    }
                });
            }
            this.setState({
                data: items
            })
        } else if (type === 'reduce') {
            console.log("typeInp", typeInp)
            items.forEach(item => {
                if (item.attrName === str) {
                    // if (typeInp === 'max' && (item['max'] < item['min'] + 1)) {
                    //     message.warning('最大值不能小于最小值')
                    // } else {
                    //     item[typeInp] = this.state.data[index - 1][typeInp] - 1;
                    // }
                    let val = null;
                    if (typeInp === 'max') {
                        if(Number(item['max'])) {
                            if(+item['max'] < +item['min'] + 1) {
                                message.warning('最大值不能小于最小值')
                            } else {
                                val = item[typeInp];
                                item[typeInp] = val.toString().includes(".") ? (+val - 1).toFixed(2) : (+val) - 1;
                            }
                        } else {
                            val = item['min'];
                            item[typeInp] = val.toString().includes(".") ? (+val + 1).toFixed(2) :  (+val) + 1;
                        }
                    } else if(typeInp === 'min') {
                        if(Number(item['min']) == 0 || Number(item['min'])) {
                            val = item[typeInp];
                            item[typeInp] = val.toString().includes(".") ? (+val - 1).toFixed(2) : (+val) - 1;
                        } else {
                            val = item['max'];
                            item[typeInp] = val.toString().includes(".") ? (+val - 1).toFixed(2) :  (+val) - 1;
                        }
                    } else {
                        val = item[typeInp];
                         console.log(val)
                         if(Number(val) == 0 || Number(val)) {
                             item[typeInp] = val.toString().includes(".") ? (+val - 1).toFixed(2) : (+val) - 1;
                        } else {
                            item[typeInp] = 0-1;
                        }
                    }
                }
            });
            this.setState({
                data: items
            })
        } else {
            items.forEach(item => {
                if (item.attrName === str) {
                    console.log(item.attrName + "===" + str)
                    switch(typeInp) {
                        case "min":
                            if(Number(item['min']) == 0 || Number(item['min'])) {
                                 if (+item['min'] + 1 > +item['max']) {
                                    message.warning('最小值不能大于最大值')
                                } else {
                                    item[typeInp] = (+item[typeInp]) + 1;
                                }
                            } else {
                                item[typeInp] = item['max'] - 1;
                            }
                            break;
                        case "max":
                            if(Number(item['max']) == 0 || Number(item['max'])) {
                                item[typeInp] = (+item[typeInp]) + 1;
                           } else {
                               item[typeInp] = item['min'] + 1;
                           }
                            break;
                        case "good":
                            console.log(item);
                            let val = item[typeInp];
                            console.log(val)
                            if(Number(val) == 0 || Number(val)) {
                                item[typeInp] = (+val) + 1;
                           } else {
                               item[typeInp] = 1;
                           }
                            break;
                        default:
                            break;
                    };
                }
            });
            this.setState({
                data: items
            })
        }
    }

    render() {
        const {data} = this.props;
        return (
            <div>
                <p>
                    <span>分类</span>
                    <span>限值</span>
                    <span>最佳值</span>
                </p>
                <ul>
                    {
                        data.map((item, index) => (
                            <li key={index}>
                                <div className="goodRange">
                                    <span>&nbsp;</span>
                                    <div>
                                        <span className="degree">{item.unit}</span>
                                        <div className="editValue good">
                                            <span
                                                onClick={(e) => this.setShipParams(item.id, null, 'reduce', item.attrName, 'good')}>-</span>
                                            <input type="text" className="editInp" value={item.good}
                                                   onChange={(e) => this.setShipParams(item.id, e, 'inp', item.attrName, 'good')}/>
                                            <span
                                                onClick={(e) => this.setShipParams(item.id, null, 'add', item.attrName, 'good')}>+</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="goodRange">
                                    <span className="word">{item.val}</span>
                                    <div>
                                        <span className="degree">{item.unit}</span>
                                        <div className="editValue max">
                                            <span
                                                onClick={(e) => this.setShipParams(item.id, null, 'reduce', item.attrName, 'max')}>-</span>
                                            <input type="text" className="editInp" value={item.max}
                                                   onChange={(e) => this.setShipParams(item.id, e, 'inp', item.attrName, 'max')}/>
                                            <span
                                                onClick={(e) => this.setShipParams(item.id, null, 'add', item.attrName, 'max')}>+</span>
                                        </div>

                                        <span className="degree">-</span>
                                        <div className="editValue min">
                                            <span
                                                onClick={(e) => this.setShipParams(item.id, null, 'reduce', item.attrName, 'min')}>-</span>
                                            <input className="editInp" type="text" value={item.min}
                                                   onChange={(e) => this.setShipParams(item.id, e, 'inp', item.attrName, 'min')}/>
                                            <span
                                                onClick={(e) => this.setShipParams(item.id, null, 'add', item.attrName, 'min')}>+</span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    }
                </ul>
            </div>
        )
    }
}

export default LimitSet;
