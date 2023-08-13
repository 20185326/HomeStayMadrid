const delay = (ms) => new Promise((res =>  setTimeout(res, ms)));
const {readFileSync} = require('fs');
const { join } = require('path');


async function EnviaMensaje(ctx,provider,customer){
    const abc = await provider.getInstance();
    await delay(10000)//Se espera 10 segundos para que no exista error con la promesa provider
    let message
    if(customer.secondMessage==undefined){
        message = {text:`Hola soy Mery, un potencial cliente te ha enviado los siguientes mensajes: 
- ${customer.firstMessage}
Por favor contacta al siguiente número:`};
    }
    else if(customer.lastMessage==undefined){
        message = {text:`Hola soy Mery, un potencial cliente te ha enviado los siguientes mensajes: 
- ${customer.firstMessage}
- ${customer.secondMessage}
Por favor contacta al siguiente número:`};
    } else {
        message = {text:`Hola soy Mery, un potencial cliente te ha enviado los siguientes mensajes: 
- ${customer.firstMessage}
- ${customer.secondMessage}
-  ${customer.lastMessage}
Por favor contacta al siguiente número:`};
    }
    console.log(ctx.key.remoteJid)
    await abc.sendMessage("34601242791@s.whatsapp.net",message);
    const contact={contacts: {
            contacts: [
            {
                vcard:
                "BEGIN:VCARD\n" +
                "VERSION:3.0\n" +
                `FN:${ctx.pushName}\n` +
                `ORG:${ctx.pushName};\n` +
                `TEL;type=CELL;type=VOICE;waid=${ctx.from}:+${ctx.from}\n` +
                "END:VCARD",
            },
            ],
        },
    }
    
    await abc.sendMessage("34601242791@s.whatsapp.net", contact)
}
async function fakeMessage(ctx,provider){
    let jid = ctx.key.remoteJid
    let refProvider = await provider.getInstance()
    await refProvider.presenceSubscribe(jid)
    await delay(100)
    await refProvider.sendPresenceUpdate('composing', jid)
}
const getPrompt = async (promp,txt) => {
    const pathPrompt = join(process.cwd(),promp);
    const text = readFileSync(join(pathPrompt,txt), "utf-8");
    return text;
};
module.exports = {EnviaMensaje,fakeMessage,getPrompt};