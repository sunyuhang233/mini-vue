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
    _v_isRef = true;
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
