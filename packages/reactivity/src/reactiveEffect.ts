import { activeEffect, trackEffect, triggerEffects } from './effect';

/**
 * {name:"hang",age:30}:{
 * age:{
 * effect
 * },
 * name:{
 * effect,effect
 * }
 *
 * }
 */

// 存放依赖收集的关系
const targetMap = new WeakMap();

export function createDep(cleanup: () => void, key: string) {
    const dep = new Map() as any;
    dep.cleanup = cleanup;
    dep.name = key;
    return dep;
}

export function track(target: any, key: any) {
    if (!activeEffect) return;
    // 有没有activeEffect 如果有说明这个key是在effect中访问的 如果没有说明不是在effect中访问的 不用进行收集
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)));
    }
    // 将当前effect放到dep中 后续根据值的变化触发dep中存放的effect
    trackEffect(activeEffect, dep);
}

export function trigger(target: any, key: any, value: any, oldValue: any) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const dep = depsMap.get(key);
    if (!dep) return;
    triggerEffects(dep);
}
