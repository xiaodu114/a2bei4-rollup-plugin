//  【问题】
//      1、这个插件在rollup多页面时还有点问题。需要针对不同的 url 开启一个 page

//  引入依赖
const child_process = require("child_process");
const http = require("http");
const https = require("https");

//  引入npm包依赖
const puppeteer = require("puppeteer-core");

function sleep(sec) {
    return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

function getRemoteDebuggingInfo(url) {
    return new Promise((resolve, reject) => {
        (new URL(url).protocol == "https:" ? https : http)
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

const PLUGIN_NAME = "a2bei4-rollup-auto-reload-by-puppeteer";

function logWrapper(msg) {
    console.log(`【${PLUGIN_NAME}】插件信息：${msg}`);
}

let page = null;

export default function byPuppeteer({ mode = "launch", browserName = "chrome", browserExePath, reloadUrl, fillForm }) {
    return {
        name: PLUGIN_NAME,
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
                        logWrapper(JSON.stringify(error));
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
                    logWrapper("已经为您打开指定页面!");
                } else {
                    logWrapper("启动或者连接浏览器失败!");
                }
            } else {
                await page.reload();
                logWrapper("已经帮您刷新，快去看看吧！");
            }
            return;
        }
    };
}
