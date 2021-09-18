import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import store from './redux/store'

import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import App from './App';

import './index.less'

ReactDOM.render(
  < ConfigProvider locale={zhCN} >{/* antd语言采取中文 */}
    <Provider store={store}>
      <App />
    </Provider>
  </ConfigProvider >,
  document.getElementById('root')
);
