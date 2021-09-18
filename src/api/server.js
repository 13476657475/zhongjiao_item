// api.js
import { httpGet, httpPost } from './http.js';

// 加载可视化船体数据
export const visualSystemTable = (params = {}) => httpGet({ url: 'web/ashx/sheepcontrol.ashx', params })
// 复制可视化船体数据
export const copyShip = (params = {}) => httpGet({ url: 'web/ashx/sheepcontrol.ashx', params })
// 删除可视化船体数据
export const deleteShip = (params = {}) => httpGet({ url: 'web/ashx/sheepcontrol.ashx', params })
// 创建船体
export const createShip = (params = {}) => httpGet({ url: 'web/ashx/sheepcontrol.ashx', params })

export const requestLand = (params = {}) => httpGet({ url: '3DHandler.ashx', params })

// post demo
export const save = (data) => {
  return httpPost({
    url: 'apps/wechat/api/save_member',
    data
  })
}
