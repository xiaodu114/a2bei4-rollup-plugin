//  参考：
//       https://rollupjs.org/guide/en/#thisaddwatchfile
//       https://www.npmjs.com/package/rollup-plugin-watch

const PLUGIN_NAME = "a2bei4-rollup-watch-external";

export default function watchExternal(ids) {
    return {
        name: PLUGIN_NAME,
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
