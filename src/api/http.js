// http.js
import axios from 'axios';
let url1 = 'http://localhost/DTPM/Ship3D/Suction';
let url3 = 'http://192.168.1.112:8082';
// url4 = 'http://10.68.163.129/DTPM/Ship3D/Suction';

// 环境的切换
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = url3;
} else if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = url1;
}

// 请求拦截器
axios.interceptors.request.use(
  config => {
    // token && (config.headers.Authorization = token)
    return config
  },
  error => {
    return Promise.error(error)
  })

axios.defaults.timeout = 5000000

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

// 响应拦截器
axios.interceptors.response.use(response => {
  if (response.status === 200) {
    if (response.data.code === 511) {
      // 未授权调取授权接口
    } else if (response.data.code === 510) {
      // 未登录跳转登录页
    } else {
      return Promise.resolve(response)
    }
  } else {
    return Promise.reject(response)
  }
}, error => {
  // 我们可以在这里对异常状态作统一处理
  if (error) {
    // 处理请求失败的情况
    // 对不同返回码对相应处理
    return Promise.reject(error)
  }
})

// get 请求
export function httpGet({
  url,
  params = {}
}) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params
    }).then((res) => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}

// post请求
export function httpPost({
  url,
  data = {},
  params = {}
}) {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'post',
      transformRequest: [function (data) {
        let ret = ''
        for (let it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
      }],
      // 发送的数据
      data,
      // url参数
      params

    }).then(res => {
      resolve(res)
    })
  })
}
