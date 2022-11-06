//#region   第一种写法

// import tempWatchExternal from "./watchExternal/index";
// export const watchExternal = tempWatchExternal;

//#endregion

//  下面是第二种方式

//  监听外部文件（无关文件）
export { default as watchExternal } from "./watchExternal/index";

//  自动刷新第一版
export { default as reloadBySelenium } from "./autoReload/bySelenium";
//  自动刷新第二版
export { default as reloadByPuppeteer } from "./autoReload/byPuppeteer";
//  自动刷新第三版
export { default as reloadBySSE } from "./autoReload/bySSE";
