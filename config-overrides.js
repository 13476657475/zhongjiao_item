const { override, fixBabelImports, addLessLoader, addWebpackPlugin, useEslintRc } = require('customize-cra');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

process.env.GENERATE_SOURCEMAP = "false"; // 打包时候移除所有的map文件
module.exports = override(
    fixBabelImports('antd', {
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        lessOptions: { // 如果使用lessloader@5，请移除 lessOptions 这一级直接配置选项。
            javascriptEnabled: true,
            modifyVars: { '@primarycolor': '#1DA57A' },
        },
    }),
    addWebpackPlugin(new AntdDayjsWebpackPlugin()),
    useEslintRc(),
);