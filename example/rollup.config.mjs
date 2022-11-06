//#region   测试 npm 本地包

//  包项目目录下
//      包项目依赖 puppeteer-core rollup selenium-webdriver
//      1、建立链接：npm link
//      2、删除链接：npm unlink
//          说明：开始删除时没有添加包名，报错了……所以需要添加包名
//  测试项目下
//      1、安装：
//          npm i puppeteer-core rollup rollup-plugin-copy selenium-webdriver -D
//          npm link a2bei4-rollup-plugin
//          说明：使用本地包时不会顺便安装其依赖的其他包，所以这里要自己安装
//      2、卸载：npm unlink --no-save a2bei4-rollup-plugin

//#endregion

//  npm i a2bei4-rollup-plugin rollup-plugin-copy
//  https://blog.51cto.com/u_15127697/3633383

import copy from "rollup-plugin-copy";
import { watchExternal, reloadBySelenium, reloadByPuppeteer, reloadBySSE } from "a2bei4-rollup-plugin";

let seleniumBrowserOption = {
    name: "edge",
    driverPath: "D:\\ProgramOther\\edgedriver_win64\\msedgedriver.exe"
};

//  http://127.0.0.1:8899/reload-page-by-sse
let sseOption = {
    hostname: "127.0.0.1",
    port: "8899",
    path: "reload-page-by-sse"
};

let page1Plugins = [],
    page2Plugins = [];

//#region   第一次尝试之 Selenium 方案

// page1Plugins.push(
//     reloadBySelenium({
//         browser: seleniumBrowserOption,
//         reload: {
//             url: "F:\\GitHub\\a2bei4-rollup-plugin-test\\dist\\index.html"
//         }
//     })
// );

//#endregion

//#region   第二次尝试之 Puppeteer 方案

// page1Plugins.push(
//     reloadByPuppeteer({
//         browserName: "chrome",
//         browserExePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
//         reloadUrl: "F:\\GitHub\\a2bei4-rollup-plugin-test\\dist\\index.html"
//     })
// );

// page1Plugins.push(
//     reloadByPuppeteer({
//         browserName: "edge",
//         browserExePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
//         reloadUrl: "F:\\GitHub\\a2bei4-rollup-plugin-test\\dist\\index.html"
//     })
// );

//#endregion

//#region   第三次尝试 SSE | WS 方案

page1Plugins.push(reloadBySSE(sseOption));
page2Plugins.push(reloadBySSE(sseOption));

//#endregion

//  【说明】
//      1、使用第一种或者第二种方式时目前仅可以一个页面
//      2、使用第三种方式时可以多个页面

let page1Entry = {
    input: "./src/index.js",
    output: {
        format: "iife",
        file: "./dist/index.js",
        banner: `/*!
             * rollup自动刷新页面测试之页面1
             */
`
    },
    plugins: [
        watchExternal(["./src/index.html"]),
        copy({
            targets: [
                {
                    src: "./src/index.html",
                    dest: "./dist"
                }
            ]
        }),
        ...page1Plugins
    ]
};

let page2Entry = {
    input: "./src/index2.js",
    output: {
        format: "iife",
        file: "./dist/index2.js",
        banner: `/*!
         * rollup自动刷新页面测试之页面2
         */
`
    },
    plugins: [
        watchExternal(["./src/index2.html"]),
        copy({
            targets: [
                {
                    src: "./src/index2.html",
                    dest: "./dist"
                }
            ]
        }),
        ...page2Plugins
    ]
};

export default [page1Entry, page2Entry];
