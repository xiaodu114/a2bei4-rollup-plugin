//  安装依赖
//  npm i puppeteer-core selenium-webdriver
//  安装开发依赖
//  npm i rollup -D

//#region 加载 package.json 文件

//  参考：  https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/

//  方案一：下面两种加载方式都有警告（有的说是node不是最新版本的原因呢）。如下：ExperimentalWarning: Importing JSON modules is an experimental feature.
//import pkg from "./package.json" assert { type: "json" };
//const { default: pkg } = await import("./package.json", { assert: { type: "json" } });

//  方案二：没有警告，但是没有智能提示。
import { readFile } from "fs/promises";
const pkg = JSON.parse(await readFile(new URL("./package.json", import.meta.url)));

//#endregion

//import { builtinModules } from "module";
const externalPkgs = Object.keys(pkg.dependencies).concat(["fs", "path"]);

export default {
    input: "./src/index.js",
    output: [
        {
            file: pkg.main,
            format: "cjs"
        },
        {
            file: pkg.module,
            format: "esm"
        }
    ],
    external: externalPkgs
};
