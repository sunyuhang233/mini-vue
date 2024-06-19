export function effect(fn: () => any, options?: any) {
    const _effect = new ReactiveEffect(fn, () => {
        _effect.run();
    });

    _effect.run();

    return _effect;
}

export let activeEffect: any;

class ReactiveEffect {
    // 是否为响应式
    active = true;
    // 记录当前effect执行次数
    _trackId = 0;
    // deps
    deps: any = [];
    _depsLength = 0;
    constructor(public fn: () => any, public scheduler: any) {
        this.fn = fn;
        this.scheduler = scheduler;
    }

    run() {
        // 如果不是响应式直接执行
        if (!this.active) return this.fn();
        // 如果是响应式需要执行依赖收集
        let lasetEffect = activeEffect;
        try {
            activeEffect = this;
            return this.fn();
        } finally {
            activeEffect = lasetEffect;
        }
    }
}

export function trackEffect(effect: ReactiveEffect, dep: any) {
    dep.set(effect, effect._trackId);
    // dep与effect关联
    effect.deps[effect._depsLength++] = dep;
}

export function triggerEffects(dep: any) {
    for (const effct of dep.keys()) {
        if (effct.scheduler) effct.scheduler();
    }
}
