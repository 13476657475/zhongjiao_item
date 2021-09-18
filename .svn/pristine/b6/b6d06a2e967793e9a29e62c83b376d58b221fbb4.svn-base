import { workerOnMessage as workerOnMessageByLand } from './index';
import { workerOnMessage as workerOnMessageByLandScene } from './scene';

export let worker = new Worker('./worker/work.js');

// 接受数据回调
worker.onmessage = ({ data }) => {
    workerOnMessageByLand(data);
    workerOnMessageByLandScene(data);
}; 