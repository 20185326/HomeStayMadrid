
require('dotenv').config()
const {getPrompt}=require('../modulacion/BibliotecaAndre/scrips') 
class IA {
    conversations = {}; // Objeto para almacenar las conversaciones
    optionsGPT = { model: "gpt-3.5-turbo-0301" , temperature: 0.0, maxTokens: 300 };
    openai = undefined;
    constructor(nombre) {
        this.init(nombre).then(nombre);
    }
    /**
     * Esta función inicializa
     */
    init = async (nombre) => {
        const { ChatGPTAPI } = await import("chatgpt");
        this.openai = new ChatGPTAPI(
            {
                apiKey: process.env.OPENAI_API_KEY
            }
        );
        const data = await getPrompt("IAS",nombre);
        this.openai._systemMessage = data;
        //this._completionParams.temperature=0;
    };

    /**
     * Manejador de los mensajes
     * Su función es enviar un mensaje a WhatsApp
     * @param {string} phoneNumber - Número de teléfono del emisor del mensaje
     * @param {string} message - Mensaje del emisor
     * @returns {Promise} - Promesa con la respuesta de ChatGPT
     */
    handleMsgChatGPT = async (phoneNumber, message) => {
        const conversationId = this.getConversationId(phoneNumber);
        const parentMessageId = this.getLastMessageId(phoneNumber);

        const interaccionChatGPT = await this.openai.sendMessage(message, {
            conversationId: conversationId,
            parentMessageId: parentMessageId
        });

        this.addToConversation(phoneNumber, interaccionChatGPT);
            return interaccionChatGPT;
    };

    /**
     * Obtiene el ID de conversación asociado a un número de teléfono
     * @param {string} phoneNumber - Número de teléfono
     * @returns {string|null} - ID de conversación o null si no existe
     */
    getConversationId = (phoneNumber) => {
        if (this.conversations.hasOwnProperty(phoneNumber)) {
            return this.conversations[phoneNumber].conversationId;
        }
        return null;
    };
    /**
     * Obtiene el ID del último mensaje en una conversación asociada a un número de teléfono
     * @param {string} phoneNumber - Número de teléfono
     * @returns {string|null} - ID del último mensaje o null si no existe
     */
    getLastMessageId = (phoneNumber) => {
        if (this.conversations.hasOwnProperty(phoneNumber)) {
            const queue = this.conversations[phoneNumber].queue;
            if (queue.length >= 2) {
                return queue[queue.length - 2].id;
            } else if (queue.length === 1) {
                return queue[0].id;
            }
        }
        return null;
    };

    /**
     * Agrega una interacción a la conversación asociada a un número de teléfono
     * @param {string} phoneNumber - Número de teléfono
     * @param {object} interaccion - Interacción con ChatGPT
     */
    addToConversation = (phoneNumber, interaccion) => {
        if (!this.conversations.hasOwnProperty(phoneNumber)) {
            this.conversations[phoneNumber] = {
                conversationId: undefined,
                queue: []
            };
        }

        const queue = this.conversations[phoneNumber].queue;

        if (queue.length >= 3) {
            queue.shift();
        }

        queue.push(interaccion);

        if (!this.conversations[phoneNumber].conversationId) {
            this.conversations[phoneNumber].conversationId = interaccion.conversationId;
        }
    };
}

module.exports = IA;

