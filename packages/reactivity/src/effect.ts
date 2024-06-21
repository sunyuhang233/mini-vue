import { DirtyLevels } from './constants';

/**
 *  effect副作用函数
 * @param fn 传递函数
 * @param options 配置项
 * @returns 返回更新函数
 */
export function effect(fn: () => void, options?: any) {
    // 1.构建effect类
    const _effect = new ReactiveEffect(fn, () => {
        _effect.run();
    });

    // 2.调用effect类的run方法
    _effect.run();

    // 3.如果用户传递配置项就将用户传递的覆盖掉内置的
    if (options) {
        Object.assign(_effect, options); //用户传递的覆盖掉内置的
    }

    // 4.返回run方法
    const runner = _effect.run.bind(_effect) as any;

    // 5.将runner的effect属性指向_effect
    runner.effect = _effect as any; // 可以在run方法中拿到effect

    // return _effect;

    // 6.返回run方法
    return runner; // 外界可以自己调用run方法进行渲染
}

/**
 * 全局effect对象
 */
export let activeEffect: any;

/**
 * 全局Effect对象
 */
export class ReactiveEffect {
    // 是否为响应式
    active = true;
    // 记录当前effect执行次数
    _trackId = 0;
    // deps
    deps: any = [];
    _depsLength = 0;
    // 是否正在执行
    _running = 0;
    // 是否是脏值 默认脏值
    _dirtyLevel = DirtyLevels.Dirty;
    constructor(public fn: () => any, public scheduler: any) {
        this.fn = fn;
        this.scheduler = scheduler;
    }

    public get dirty() {
        return this._dirtyLevel === DirtyLevels.Dirty;
    }

    public set dirty(value) {
        this._dirtyLevel = value ? DirtyLevels.Dirty : DirtyLevels.NoDirty;
    }

    run() {
        // 每次运行后此值为不脏
        this._dirtyLevel = DirtyLevels.NoDirty;
        // 如果不是响应式直接执行
        if (!this.active) return this.fn();
        // 如果是响应式需要执行依赖收集
        let lasetEffect = activeEffect;
        try {
            activeEffect = this;
            // 重新执行时清空上一次的依赖
            preCleanEffect(this);
            // 运行值每次运行就++
            this._running++;
            return this.fn();
        } finally {
            // 每次执行完毕都清空
            this._running--;
            postCleanEffect(this);
            activeEffect = lasetEffect;
        }
    }
}

/**
 *  后置处理 主要解决之前dep与现在dep个数不一致的问题
 * @param effect effect对象
 */
export function postCleanEffect(effect: ReactiveEffect) {
    if (effect.deps.length > effect._depsLength) {
        for (let i = effect._depsLength; i < effect.deps.length; i++) {
            cleanDepEffect(effect.deps[i], effect);
        }
        effect.deps.length = effect._depsLength;
    }
}

/**
 *  effect与dep关联
 * @param effect effect实例
 * @param dep 依赖
 */
export function trackEffect(effect: ReactiveEffect, dep: any) {
    // 第一版
    // dep.set(effect, effect._trackId);
    // // dep与effect关联
    // effect.deps[effect._depsLength++] = dep;
    // 第二版
    if (dep.get(effect) !== effect._trackId) {
        dep.set(effect, effect._trackId);

        let oldDep = effect.deps[effect._depsLength];

        if (oldDep != dep) {
            if (oldDep) cleanDepEffect(oldDep, effect);
            effect.deps[effect._depsLength++] = dep;
        } else {
            effect._depsLength++;
        }
    }
}

/**
 * 清除dep与effect的关联
 * @param dep 依赖
 * @param effect effect实例对象
 */
const cleanDepEffect = (dep: any, effect: ReactiveEffect) => {
    dep.delete(effect);
    if (dep.size === 0) dep.cleanup();
};

/**
 * 触发依赖中effect
 * @param dep 依赖
 */
export function triggerEffects(dep: any) {
    for (const effct of dep.keys()) {
        // 如果这个值不脏 但是触发更新需要将脏值标记为脏值
        if (effct._dirtyLevel < DirtyLevels.Dirty) {
            effct._dirtyLevel = DirtyLevels.Dirty;
        }
        if (effct.scheduler) {
            // 如果没有正在运行就运行
            if (!effct._running) effct.scheduler();
        }
    }
}

/**
 * 前置处理
 * @param effect effect实例
 */
export function preCleanEffect(effect: ReactiveEffect) {
    effect._depsLength = 0;
    effect._trackId++; // 每次执行+1 如果当前是同一个effect id就是相等的
}
