import { isObject } from '@vue/shared';

const reactiveMap = new WeakMap();

enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
}

export function reactive(target: object) {
    return createReactiveObject(target);
}
const mutableHandlers: ProxyHandler<object> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
        const result = Reflect.set(target, key, value, receiver);
        return result;
    },
};
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
