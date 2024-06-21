import { isFunction, isObject } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { isReactive } from './reactive';
import { isRef } from './ref';

/**
 *  watch函数
 * @param source 源
 * @param cb 回调函数
 * @param options 配置选项
 * @returns
 */
export function watch(source: any, cb: any, options = {} as any) {
    // watchEffect也是基于doWatch来实现的
    return doWatch(source, cb, options);
}

export function watchEffect(effect: any, options = {} as any) {
    doWatch(effect, null, options);
}

/**
 *  开启监听
 * @param source 源
 * @param cb 回调函数
 * @param deep 是否开启深层监听
 */
function doWatch(source: any, cb: any, { deep, immediate }: any) {
    // source => getter
    const reactiveGetter = (source: any) =>
        traverse(source, deep === false ? 1 : undefined);
    let getter: any;
    // 产生一个可以给ReactiveEffect来使用的getter 需要对这个对象进行取值操作 会关联当前的reactiveEffect
    if (isReactive(source)) {
        // reactiveGetter相当于是一个getter 负责取值
        getter = () => reactiveGetter(source);
    }

    // 判断是否为Ref
    if (isRef(source)) {
        getter = () => source.value;
    }

    // 判断是否为函数
    if (isFunction(source)) {
        getter = source;
    }

    let oldValue: any;

    const job = () => {
        if (cb) {
            const newValue = effect.run();
            cb(newValue, oldValue);
            oldValue = newValue;
        } else {
            effect.run(); //watchEffect只需要用户传递一个回调函数 就可以实现一次监听
        }
    };

    const effect = new ReactiveEffect(getter, job);

    if (cb) {
        // 立即执行一次用户传进来的回调函数 传递新增和老值
        if (immediate) {
            job();
        } else {
            oldValue = effect.run();
        }
    } else {
        // watchEffect只需要用户传递一个回调函数 就可以实现一次监听
        effect.run();
    }
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
