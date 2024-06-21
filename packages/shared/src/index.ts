/**
 *  判断是否是对象
 * @param obj 传入判断参数
 * @returns
 */
export function isObject(obj: object) {
    return obj !== null && typeof obj === 'object';
}

/**
 *  判断是否是函数
 * @param value 传入判断参数
 * @returns
 */
export function isFunction(value: any) {
    return typeof value === 'function';
}
