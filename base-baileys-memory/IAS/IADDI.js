
require('dotenv').config()
const {getPrompt}=require('../modulacion/BibliotecaAndre/scrips') 
class IADDI {
    lastInteraction=undefined
    optionsGPT = { model: "gpt-3.5-turbo-0301" , temperature: 0, maxTokens: 300 };
    openai = undefined;
    constructor(nombre) {
        this.init(nombre).then(nombre);
    }
    init = async (nombre) => {
        const { ChatGPTAPI } = await import("chatgpt");
        this.openai = new ChatGPTAPI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const data = await getPrompt("IAS",nombre);
        this.openai._systemMessage = data;
    };

    handleMsgChatGPT = async (body) => {
        const interaccionChatGPT = await this.openai.sendMessage(body);
        this.lastInteraction = interaccionChatGPT;
        return interaccionChatGPT;
    };
}

module.exports = IADDI;