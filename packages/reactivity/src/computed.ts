import { isFunction } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { trackRefValue, triggerRefValue } from './ref';

/**
 *  computed实现
 * @param getterOrOptions 传入的配置项
 * @returns
 */
export function computed(getterOrOptions: any) {
    let onlyGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOrOptions; // getter就是传入的函数
        setter = () => {}; // setter就是一个空函数
    } else {
        getter = getterOrOptions.get; // getter函数
        setter = getterOrOptions.set; // setter函数
    }
    return new ComputedRefImpl(getter, setter); // 计算属性ref
}

class ComputedRefImpl {
    //当前值
    _value: any;
    // effect对象
    effect: any;
    // 依赖
    dep: any;
    constructor(public getter: any, public setter: any) {
        this.effect = new ReactiveEffect(
            () => getter(this._value), // 用户的fn state.name
            // 计算属性依赖值变化了 我们需要触发effect渲染 重新执行
            // 依赖的属性变化后需要重新触发渲染 还需要将dirty设置为true
            () => triggerRefValue(this)
        );
    }
    get value() {
        // 这里我们需要做额外处理
        // return this.effect.run();
        if (this.effect.dirty) {
            // 第一次进来默认是脏的
            // 默认取值一定是脏的 但是执行一次run后就不脏了
            this._value = this.effect.run();
            trackRefValue(this);
            // 如果当前在effect中访问了计算属性 计算属性是可以收集这个effect的
        }

        return this._value;
    }

    set value(newValue) {
        this.setter(newValue);
    }
}
