'use strict';

//  参考：
//       https://rollupjs.org/guide/en/#thisaddwatchfile
//       https://www.npmjs.com/package/rollup-plugin-watch

const PLUGIN_NAME$3 = "a2bei4-rollup-watch-external";

function watchExternal(ids) {
    return {
        name: PLUGIN_NAME$3,
        buildStart() {
            if (Array.isArray(ids) && ids.length) {
                [].forEach.call(ids, (id) => {
                    //  官网是这样介绍"addWatchFile"的
                    //  id can be an absolute path to a file or directory or a path relative to the current working directory.
                    this.addWatchFile(id);
                });
            }
        }
    };
}

/**
 * selenium 说明
 * 官网：https://www.selenium.dev
 * 使用步骤：
 *  1、安装驱动
 *      不同的浏览器驱动需要分别安装,目前支持Edge和Chrome
 *      这里维护者一些驱动地址：https://www.selenium.dev/zh-cn/documentation/webdriver/getting_started/install_drivers/
 *  2、安装类库
 *      支持N多种语言，这里使用的是JavaScript的Selenium库：npm i selenium-webdriver
 */

//  【问题】
//      1、这个插件在rollup多页面时还有点问题。需要针对不同的 url 开启一个 driver

// const process1 = require("process");
// process1.stderr.write(`打印日志信息……`);

const PLUGIN_NAME$2 = "a2bei4-rollup-auto-reload-by-selenium";

const { Builder } = require("selenium-webdriver");
const edge = require("selenium-webdriver/edge");
const chrome = require("selenium-webdriver/chrome");
let edgeOptions = new edge.Options();
let chromeOptions = new chrome.Options();
let driver;

function logWrapper$2(msg) {
    console.log(`【${PLUGIN_NAME$2}】插件信息：${msg}`);
}

function bySelenium(option) {
    return {
        name: PLUGIN_NAME$2,
        async closeBundle() {
            if (!option) return;
            if (!(option.browser && option.browser.name && option.browser.driverPath)) return;
            if (!(option.reload && option.reload.url)) return;
            if (!driver) {
                switch (option.browser.name) {
                    case "edge": {
                        driver = await new Builder().setEdgeOptions(edgeOptions).forBrowser("MicrosoftEdge").setEdgeService(new edge.ServiceBuilder(option.browser.driverPath)).build();
                        break;
                    }
                    case "chrome": {
                        driver = await new Builder().setChromeOptions(chromeOptions).forBrowser("chrome").setChromeService(new chrome.ServiceBuilder(option.browser.driverPath)).build();
                        break;
                    }
                }
                if (driver) {
                    await driver.get(option.reload.url);
                } else {
                    logWrapper$2("构建WebDriver失败！");
                }
            } else {
                await driver.navigate().refresh();
                //await driver.manage().window().maximize();
                driver.switchTo().window(await driver.getWindowHandle());
                logWrapper$2("页面已刷新，赶紧看看吧！");
            }
            return;
        }
    };
}

//  【问题】
//      1、这个插件在rollup多页面时还有点问题。需要针对不同的 url 开启一个 page

//  引入依赖
const child_process = require("child_process");
const http$1 = require("http");
const https = require("https");

//  引入npm包依赖
const puppeteer = require("puppeteer-core");

function sleep(sec) {
    return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

function getRemoteDebuggingInfo(url) {
    return new Promise((resolve, reject) => {
        (new URL(url).protocol == "https:" ? https : http$1)
            .get(url, (res) => {
                if (res.statusCode === 200) {
                    let data = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });
                    res.on("end", () => {
                        resolve(JSON.parse(data));
                    });
                } else {
                    reject(res.statusMessage);
                }
            })
            .on("error", (err) => {
                reject(JSON.stringify(err));
            })
            .end();
    });
}

const PLUGIN_NAME$1 = "a2bei4-rollup-auto-reload-by-puppeteer";

function logWrapper$1(msg) {
    console.log(`【${PLUGIN_NAME$1}】插件信息：${msg}`);
}

let page = null;

function byPuppeteer({ mode = "launch", browserName = "chrome", browserExePath, reloadUrl, fillForm }) {
    return {
        name: PLUGIN_NAME$1,
        async closeBundle() {
            if (!browserExePath) return;
            if (!reloadUrl) return;
            if (!page) {
                //  弄个浏览器
                let browser = null;
                if (mode === "launch") {
                    browser = await puppeteer.launch({
                        headless: false,
                        //devtools: true,
                        defaultViewport: null,
                        executablePath: browserExePath
                    });
                } else {
                    //  这种方式太尼玛的鸡肋了，基本上是连不上，就算是关闭所有实例都不行……没有找到解决办法
                    switch (browserName) {
                        case "edge": {
                            //  https://learn.microsoft.com/zh-cn/microsoft-edge/devtools-protocol-chromium/
                            child_process.exec("start msedge --remote-debugging-port=9222");
                            break;
                        }
                        default: {
                            child_process.exec("start chrome --remote-debugging-port=9222");
                            break;
                        }
                    }
                    await sleep(1);
                    try {
                        let remoteDebuggingInfo = await getRemoteDebuggingInfo("http://localhost:9222/json/version");
                        browser = await puppeteer.connect({
                            defaultViewport: null,
                            browserWSEndpoint: remoteDebuggingInfo.webSocketDebuggerUrl
                        });
                    } catch (error) {
                        logWrapper$1(JSON.stringify(error));
                    }
                }
                //  浏览器跳转到指定的页面
                if (browser) {
                    page = await browser.newPage();
                    await page.goto(reloadUrl);
                    //  下面配置可以帮你自动登录
                    if (fillForm) {
                        if (Array.isArray(fillForm.form) && fillForm.form.length) {
                            for (const item of fillForm.form) {
                                await page.type(item.selector, item.value);
                            }
                        }
                        if (fillForm.submit) {
                            page.click(fillForm.submit.selector, fillForm.submit.value);
                        }
                    }
                    logWrapper$1("已经为您打开指定页面!");
                } else {
                    logWrapper$1("启动或者连接浏览器失败!");
                }
            } else {
                await page.reload();
                logWrapper$1("已经帮您刷新，快去看看吧！");
            }
            return;
        }
    };
}

const http = require("http");

const PLUGIN_NAME = "a2bei4-rollup-auto-reload-by-sse";

function logWrapper(msg) {
    console.log(`【${PLUGIN_NAME}】插件信息：${msg}`);
}

let server = null,
    serverRes = null;

function bySSE({ hostname, port, path }) {
    return {
        name: PLUGIN_NAME,
        async closeBundle() {
            if (!server) {
                server = http
                    .createServer((req, res) => {
                        if (req.url.indexOf(path) >= 0) {
                            res.setHeader("Access-Control-Allow-Origin", "*");

                            res.setHeader("Connection", "keep-alive");
                            res.setHeader("Cache-Control", "no-cache");
                            res.setHeader("Content-Type", "text/event-stream");

                            res.write("data: 时间为：" + new Date() + "\n\n");
                            serverRes = res;
                        }
                    })
                    .listen(port, hostname);
                logWrapper(`SSE服务器已启动，地址为：${hostname}:${port}`);
            } else {
                if (serverRes) {
                    serverRes.write("data: 时间为：" + new Date() + "\n\n");
                    logWrapper(`消息已推送`);
                }
            }
            return;
        }
    };
}

exports.reloadByPuppeteer = byPuppeteer;
exports.reloadBySSE = bySSE;
exports.reloadBySelenium = bySelenium;
exports.watchExternal = watchExternal;
