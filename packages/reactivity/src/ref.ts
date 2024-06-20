import { activeEffect, trackEffect, triggerEffects } from './effect';
import { toReactive } from './reactive';
import { createDep } from './reactiveEffect';

export function ref(value: any) {
    return createRef(value);
}

export function createRef(value: any) {
    return new RefImpl(value);
}

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
        trackRefValue(this);
        return this._value;
    }
    set value(v) {
        if (v !== this.rawValue) {
            this.rawValue = v;
            this._value = v;
            triggerRefValue(this);
        }
    }
}

function trackRefValue(ref: RefImpl) {
    if (activeEffect) {
        trackEffect(
            activeEffect,
            (ref.dep = createDep(() => (ref.dep = undefined), 'undefined'))
        );
    }
}

function triggerRefValue(ref: RefImpl) {
    let dep = ref.dep;
    if (dep) {
        triggerEffects(dep);
    }
}

// toRef toRefs
export function toRef(object: any, key: any) {
    return new ObjectRefImpl(object, key);
}

export function toRefs(object: any) {
    const res = {} as any;
    for (const key in object) {
        res[key] = toRef(object, key);
    }
    return res;
}

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
