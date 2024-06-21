import { activeEffect, trackEffect, triggerEffects } from './effect';

/**
 * 存放依赖收集容器
 */
const targetMap = new WeakMap();

/**
 *  创建该key下的Map收集容器
 * @param cleanup 清除方法
 * @param key 当前名称
 * @returns
 */
export function createDep(cleanup: () => void, key: string) {
    const dep = new Map() as any;
    dep.cleanup = cleanup;
    dep.name = key;
    return dep;
}

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

/**
 * 依赖收集
 * @param target 目标对象
 * @param key 键值
 * @returns
 */
export function track(target: any, key: any) {
    if (!activeEffect) return;
    // 有没有activeEffect 如果有说明这个key是在effect中访问的 如果没有说明不是在effect中访问的 不用进行收集

    // 1.查看容器是否有该对象
    let depsMap = targetMap.get(target);

    // 2.没有就新增一个
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }

    // 3.查看是否有该key
    let dep = depsMap.get(key);

    // 4.没有就新增key
    if (!dep) {
        depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)));
    }

    // 5.执行依赖收集
    // 将当前effect放到dep中 后续根据值的变化触发dep中存放的effect
    trackEffect(activeEffect, dep);
}

/**
 *  依赖触发
 * @param target 目标对象
 * @param key 键值
 * @param value 新值
 * @param oldValue 旧值
 * @returns
 */
export function trigger(target: any, key: any, value: any, oldValue: any) {
    // 1.查看容器是否有该对象
    const depsMap = targetMap.get(target);
    if (!depsMap) return;

    // 2.查看容器是否有该key
    const dep = depsMap.get(key);
    if (!dep) return;

    // 3.执行依赖触发
    triggerEffects(dep);
}
