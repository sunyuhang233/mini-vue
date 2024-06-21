import { isObject } from '@vue/shared';
import { mutableHandlers, ReactiveFlags } from './baseHandler';

/**
 * 缓存代理对象容器
 */
const reactiveMap = new WeakMap();

/**
 *  构建响应式对象
 * @param target 传入需要转化的内容
 * @returns
 */
export function reactive(target: object) {
    return createReactiveObject(target);
}

/**
 *  实现响应式对象
 * @param target 传入需要转化的对象
 * 需要考虑三种情况 1.是否为对象 2，该对象是否被重复代理 3.传入的对象是否已经被代理
 * @returns
 */
export function createReactiveObject(target: any) {
    // 1.判断是否是对象
    if (!isObject(target)) return target;
    // 2.判断是否已经被代理过
    if (target[ReactiveFlags.IS_REACTIVE]) return target;
    // 3.判断是否有缓存
    const existsProxy = reactiveMap.get(target);
    if (existsProxy) return existsProxy;
    // 4.代理
    let proxy = new Proxy(target, mutableHandlers);
    // 5.缓存
    reactiveMap.set(target, proxy);
    // 6.返回代理后的对象
    return proxy;
}

/**
 *  ref转化为reactive转换函数
 * @param value 传递需要转化的值
 * @returns 根据是否为对象进行转化 为对象需要reactive代理 如果不是对象直接返回
 */
export function toReactive<T extends object>(value: T) {
    return isObject(value) ? reactive(value) : value;
}
