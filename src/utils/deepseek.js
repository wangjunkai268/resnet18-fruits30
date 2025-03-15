import OpenAI from 'openai'

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-1e65a8345c51451d983cfd292892e471',
    dangerouslyAllowBrowser: true
})

export const sendQuestion = async (msg, tagName,cb) => {
   console.log('开始调用deepseek API...')
   await openai.chat.completions.create({
        messages: [{role: 'system', content: tagName === 'LI' ? `${msg},简单介绍即可,不需要列出列表` :`请简单的给我介绍一下${msg}的相关信息,比如食用价值、季节等，不需要列出列表`}],
        model: 'deepseek-chat'
    }).then(res => {
        cb(null,res)
    }).catch(e => {
        cb(e, null)
    })
}
