// softmax函数
export const toSoftmax = (data) => {
    const expLogits = data.map((value) => {
        return [Math.exp(value[0]), value[1]]
    })

    const expSum = expLogits.reduce((sum, x) => sum + x[0], 0)

    const probablities = expLogits.map(x => {
        return [x[0] / expSum, x[1]]
    })
    return probablities
}