import { isObject } from '@vue/shared';
import { track, trigger } from './reactiveEffect';
import { reactive } from './reactive';

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
}

/**
 * 响应式对象get与set
 */
export const mutableHandlers: ProxyHandler<any> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }

        // 取值需要做依赖收集 收集某个对象的某个属性 和effect进行关联
        track(target, key);

        let res = Reflect.get(target, key, receiver); // 拿到的是取值的结果

        // 取值如果是对象就需要重新代理reactive一次
        if (isObject(res)) return reactive(res);

        // 取值就需要收集依赖
        return res;
    },
    set(target, key, value, receiver) {
        let oldValue = target[key];

        const result = Reflect.set(target, key, value, receiver);
        if (value !== oldValue) {
            // 设置值就需要触发依赖 更新视图
            trigger(target, key, value, oldValue);
        }

        return result;
    },
};
