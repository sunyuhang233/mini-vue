import { track, trigger } from './reactiveEffect';

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
}

export const mutableHandlers: ProxyHandler<any> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }

        // 取值需要做依赖收集 收集某个对象的某个属性 和effect进行关联
        track(target, key);

        // 取值就需要收集依赖
        return Reflect.get(target, key, receiver);
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
