export function effect(fn: () => void, options?: any) {
    const _effect = new ReactiveEffect(fn, () => {
        _effect.run();
    });

    _effect.run();

    if (options) {
        Object.assign(_effect, options); //用户传递的覆盖掉内置的
    }

    const runner = _effect.run.bind(_effect) as any;

    runner.effect = _effect as any; // 可以在run方法中拿到effect

    // return _effect;

    return runner; // 外界可以自己调用run方法进行渲染
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
    // 是否正在执行
    _running = 0;
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

export function postCleanEffect(effect: ReactiveEffect) {
    if (effect.deps.length > effect._depsLength) {
        for (let i = effect._depsLength; i < effect.deps.length; i++) {
            cleanDepEffect(effect.deps[i], effect);
        }
        effect.deps.length = effect._depsLength;
    }
}

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

const cleanDepEffect = (dep: any, effect: ReactiveEffect) => {
    dep.delete(effect);
    if (dep.size === 0) dep.cleanup();
};

export function triggerEffects(dep: any) {
    for (const effct of dep.keys()) {
        if (effct.scheduler) {
            // 如果没有正在运行就运行
            if (!effct._running) effct.scheduler();
        }
    }
}

export function preCleanEffect(effect: ReactiveEffect) {
    effect._depsLength = 0;
    effect._trackId++; // 每次执行+1 如果当前是同一个effect id就是相等的
}
