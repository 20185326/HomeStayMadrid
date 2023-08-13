const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
//Importaciones internas
const flowMain=require("./modulacion/flujos/flowMain")
const flowVoz=addKeyword(EVENTS.VOICE_NOTE).addAnswer("Por el momento solo respondemos texto.")

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowMain,flowVoz])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
