export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
}

export enum DirtyLevels {
    Dirty = 4, // 脏值 意味取值要运行计算属性
    NoDirty = 0, // 无脏值 就用上一次的返回结果
}
