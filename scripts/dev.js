// 这个文件会帮我们打包 packages下的模块 最终打包出js文件

// 执行命令 node scripts/dev.js reactivity -f esm   打包reactivity模块 -f esm 表示打包esm模块

// minimist作用就是将命令行参数转换成对象
import minimist from 'minimist';

import { dirname, resolve } from 'node:path';

import { fileURLToPath } from 'node:url';

import { createRequire } from 'node:module';

import esbuild from 'esbuild';

// 获取当前文件的绝对路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
/**
 * process.argv
 * [
  'E:\\software\\node\\node.exe',
  'C:\\Users\\Ahang\\Desktop\\Vue3\\scripts\\dev.js',
  'reactivity',
  '-f',
  'esm'
]
 */

// console.log(process.argv);

/**
 *  * [
  'reactivity',
  '-f',
  'esm'
]
 */
console.log(process.argv.slice(2));

// 不需要前两个 { _: [ 'reactivity' ], f: 'esm' }
const args = minimist(process.argv.slice(2));
console.log(args);

// 获取打包文件名
const target = args._[0] || 'reactivity';
console.log(target);

// 获取打包格式
const format = args.f || 'iife';
console.log(format);

// node esm模块中是没有__dirname的 所以我们需要在这里手动拼接
// 拼接入口路径 根据命令行提供的参数 进行入口拼接
//console.log(__filename, __dirname, require);
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);
console.log(entry);

// 将本地shared模块 安装到本地 reactivity模块 指令为 pnpm i @vue/shared --workspace --filter @vue/reactivity

const pkg = require(`../packages/${target}/package.json`);
// 根据需要进行打包
esbuild
    .context({
        entryPoints: [entry], // 入口
        bundle: true, // 打包在一起
        outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), // 出口
        format, // 打包格式
        platform: 'browser', // 打包后给浏览器使用
        sourcemap: true, // 生成sourceMap
        globalName: pkg.buildOptions?.name,
    })
    .then((ctx) => {
        console.log('打包完成');
        return ctx.watch(); // 监控入口文件持续更新
    });
