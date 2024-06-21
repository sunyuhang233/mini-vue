import { isObject } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { isReactive } from './reactive';

/**
 *  watch函数
 * @param source 源
 * @param cb 回调函数
 * @param options 配置选项
 * @returns
 */
export function watch(
    source: any,
    cb: (newValue?: any, oldValue?: any) => void,
    options = {} as any
) {
    // watchEffect也是基于doWatch来实现的
    return doWatch(source, cb, options);
}

/**
 *  开启监听
 * @param source 源
 * @param cb 回调函数
 * @param deep 是否开启深层监听
 */
function doWatch(
    source: any,
    cb: (newValue?: any, oldValue?: any) => void,
    { deep }: any
) {
    // source => getter
    const reactiveGetter = (source: any) =>
        traverse(source, deep === false ? 1 : undefined);
    let getter: any;
    // 产生一个可以给ReactiveEffect来使用的getter 需要对这个对象进行取值操作 会关联当前的reactiveEffect
    if (isReactive(source)) {
        getter = () => reactiveGetter(source);
    }

    let oldValue: any;

    const job = () => {
        const newValue = effect.run();
        cb(newValue, oldValue);
        oldValue = newValue;
    };

    const effect = new ReactiveEffect(getter, job);

    oldValue = effect.run();
}

/**
 *  转换类 递归遍历
 * @param source 源
 * @param depth 遍历层次
 * @param currentDepth 当前层次
 * @param seen 已经遍历过的
 */
function traverse(
    source: any,
    depth: any,
    currentDepth = 0,
    seen = new Set() as any
) {
    if (!isObject(source)) return source;
    if (depth) {
        if (currentDepth >= depth) return source;
        // 根据deep属性来看是否是深度
        currentDepth++;
    }

    if (seen.has(source)) return source;

    for (const key in source) {
        seen.add(source);
        traverse(source[key], depth, currentDepth, seen);
    }
    // 遍历就会触发get
    return source;
}
