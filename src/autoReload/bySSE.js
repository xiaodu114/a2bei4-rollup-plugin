/**
 * 说明：该插件需要配合浏览器（edge、chrome等）扩展使用，例如：https://github.com/xiaodu114/a2bei4-auto-reload-tab
 */
const http = require("http");

const PLUGIN_NAME = "a2bei4-rollup-auto-reload-by-sse";

function logWrapper(msg) {
    console.log(`【${PLUGIN_NAME}】插件信息：${msg}`);
}

let server = null,
    serverRes = null;

export default function bySSE({ hostname, port, path }) {
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
