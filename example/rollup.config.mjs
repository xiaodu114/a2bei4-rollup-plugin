//  npm i puppeteer-core rollup rollup-plugin-copy selenium-webdriver -D
//  npm link a2bei4-rollup-plugin
//  https://blog.51cto.com/u_15127697/3633383

import copy from "rollup-plugin-copy";
import { watchExternal, reloadBySelenium, reloadByPuppeteer, reloadBySSE } from "a2bei4-rollup-plugin";

let seleniumBrowserOption = {
    name: "edge",
    driverPath: "D:\\ProgramOther\\edgedriver_win64\\msedgedriver.exe"
};

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

//#region   第三次尝试

page1Plugins.push(reloadBySSE(sseOption));
page2Plugins.push(reloadBySSE(sseOption));

//#endregion

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
