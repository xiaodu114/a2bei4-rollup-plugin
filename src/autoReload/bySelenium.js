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

const PLUGIN_NAME = "a2bei4-rollup-auto-reload-by-selenium";

const { Builder } = require("selenium-webdriver");
const edge = require("selenium-webdriver/edge");
const chrome = require("selenium-webdriver/chrome");
let edgeOptions = new edge.Options();
let chromeOptions = new chrome.Options();
let driver;

function logWrapper(msg) {
    console.log(`【${PLUGIN_NAME}】插件信息：${msg}`);
}

export default function bySelenium(option) {
    return {
        name: PLUGIN_NAME,
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
                    logWrapper("构建WebDriver失败！");
                }
            } else {
                await driver.navigate().refresh();
                //await driver.manage().window().maximize();
                driver.switchTo().window(await driver.getWindowHandle());
                logWrapper("页面已刷新，赶紧看看吧！");
            }
            return;
        }
    };
}
