import { activeEffect, trackEffect, triggerEffects } from './effect';
import { toReactive } from './reactive';
import { createDep } from './reactiveEffect';

/**
 *  ref函数
 * @param value 传入的值
 * @returns
 */
export function ref(value: any) {
    return createRef(value);
}

/**
 *  构建ref响应式对象
 * @param value 传入的值
 * @returns
 */
export function createRef(value: any) {
    return new RefImpl(value);
}

/**
 * Ref实现类
 * 重点: 通过toReactive转换 判断值是否为对象 如果是对象需要进行代理
 * 实现get与set
 */
class RefImpl {
    // 增加ref标识
    __v_isRef = true;
    // 存放值
    _value;
    // 存放依赖
    dep: any;
    constructor(public rawValue: any) {
        // 需要通过toReactive转换 判断值是否为对象 如果是对象需要进行代理
        this._value = toReactive(rawValue);
    }
    get value() {
        // 获取值收集依赖
        trackRefValue(this);
        return this._value;
    }
    set value(v) {
        if (v !== this.rawValue) {
            this.rawValue = v;
            this._value = v;
            // 触发依赖更新
            triggerRefValue(this);
        }
    }
}

/**
 *  收集依赖
 * @param ref ref实例
 */
export function trackRefValue(ref: any) {
    if (activeEffect) {
        trackEffect(
            activeEffect,
            (ref.dep = createDep(() => (ref.dep = undefined), 'undefined'))
        );
    }
}

/**
 *  触发依赖更新
 * @param ref ref实例
 */
export function triggerRefValue(ref: any) {
    let dep = ref.dep;
    if (dep) {
        triggerEffects(dep);
    }
}

/**
 *  toRef
 * @param object 对象
 * @param key 键
 * @returns
 */
export function toRef(object: any, key: any) {
    return new ObjectRefImpl(object, key);
}

/**
 *  toRefs
 * @param object 对象
 * @returns
 */
export function toRefs(object: any) {
    const res = {} as any;
    for (const key in object) {
        res[key] = toRef(object, key);
    }
    return res;
}

/**
 * proxyRefs
 * @param objectWithRef 对象
 * @returns
 */
export function proxyRefs(objectWithRef: any) {
    return new Proxy(objectWithRef, {
        get(target, key, receiver) {
            let res = Reflect.get(target, key, receiver);

            return res.__v_isRef ? res.value : res; // 如果是ref 就返回.value 自动脱ref
        },
        set(target, key, value, receiver) {
            const oldVal = target[key];

            if (oldVal.__v_isRef) {
                oldVal.value = value; // 如果老值是ref 就直接赋值
                return true;
            } else {
                return Reflect.set(target, key, value, receiver);
            }
        },
    });
}

/**
 * 转为Ref实例对象
 */
class ObjectRefImpl {
    // 增加ref标识
    __v_isRef = true;
    constructor(public _object: any, public _key: any) {}

    get value() {
        return this._object[this._key];
    }

    set value(newValue: any) {
        this._object[this._key] = newValue;
    }
}

/**
 *  判断是否为ref
 * @param value 传入的值
 * @returns
 */
export function isRef(value: any) {
    return !!(value && value.__v_isRef);
}
