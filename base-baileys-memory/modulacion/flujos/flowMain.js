//Librerias principales
const {addKeyword, EVENTS} = require('@bot-whatsapp/bot')//Libreria del chatbot
//Importaciones externas
const path = require('path');
const { spawn } = require('child_process');

//Importaciones interenas
const IA = require("../../IAS/IA");
const IADDI = require('../../IAS/IADDI');
const {fakeMessage,EnviaMensaje}= require("../BibliotecaAndre/scrips"); 
const {BuscaImagenes,BuscarDireccionEstatica}=require("../BibliotecaAndre/scriptsMultimedia");

//Declariacion de IAS y variables
const IA_DDI1 = new IADDI("IADDI1.txt");
const IA_DDI2 = new IADDI("IADDI2.txt");
const IA_DDI3 = new IADDI("IADDI3.txt");
const IA_DDI4 = new IADDI("IADDI4.txt");
const IA_RF1= new IADDI("IARDF1.txt");
const IA_ESP=new IA("IAESP.txt");
const IA_HomeStay =new IA("IAHomeStay.txt");
const IA_DESP=new IA("IADESPEDIDA.txt");
const IA_OTI=new IA("IAOTI.txt");
const IA_DDD=new IA("IADDD.txt");
const IA_DI=new  IADDI("IADI.txt");
const IA_RESERVA=new IA("IARES.txt")
const IA_TRADUCTOR=new IADDI("IAT.txt")
let customersPhone = {}
const floorCode = /(BN10|HP10|HPA1|HPA2|LP05|VC58|PO109|VC62|PE154|GR28)/i;
const floorBasicDescription=`Alquileres de 1 Habitacion:
Codigo: *HPB2*  => Piso con capacidad desde 1 hasta 4 perssonas.
Codigo: *BN10*  => Piso con capacidad desde 1 hasta 4 personas .
Codigo: *VC62*  => Habitaciones con capacidad desde 1 hasta 3 personas.
Codigo: *PE154* => Habitaciones con capacidad desde 1 hasta 3 personas.
Codigo: *VC58*  => Piso con capacidad desde 2 hasta 5 personas.

Alquileres de 2 Habitacion:
Codigo: *HPA1*  => Piso con capacidad desde 2 hasta 6 personas .
Codigo: *LP05*  => Piso con capacidad desde 2 hasta  6 personas.
Codigo: *GR28*  => Piso con capacidad desde 2 hasta 5 personas.

Alquileres de 3 Habitacion:
Codigo: *HP10*  => Piso con capacidad desde 4 hasta 10 personas .
Codigo: *PO109* => Piso con capacidad desde 3 hasta  8 personas .
`

//FUNCIONES DELOGICA
function inicializarNumerosTelefonico(ctx,customersPhone) {
    // Verificar si el objeto NumerosTelefonico[ctx.from] ya existe
    if (customersPhone.hasOwnProperty(ctx.from)) {
        // Si ya existe, no hacer nada
        return;
    } else {
        // Si no existe, crear un nuevo objeto y establecer las propiedades en 0
        customersPhone[ctx.from] = {
            spamCoutner: 0,
            queriesCounter:0,
            name:ctx.pushName,
            intentionFlow:undefined,
            intentionFloor:undefined,
            firstMessage: undefined,
            secondMessage: undefined,
            lastMessage: undefined,
            language:undefined
        };
    }
    setInterval(function() {
        resetNumeroConsultas(ctx.from);
    }, 24*60*60 * 1000);//Cada 24 Horas se le reactiva la IA
}
//FUNCIONES DE NIVEL 3
async function BOT_ObjetosPerdidos(mensaje_recibido,ctx,provider,flowDynamic){
    //Falta implementar que se apague el bot al usuario y que se le notifique 
    //al numero del encargado sobre el acontecimiento
    await flowDynamic("Entiendo su preocupacion, espere un momento por favor")
}
async function BOT_RebajaRegateoDescuento(mensaje_recibido,ctx,provider,flowDynamic){
    //Falta implementar que se apague el bot al usuario y que se le notifique 
    //al numero del encargado sobre el acontecimiento
    await flowDynamic("Ok, espere un momento por favor para analizar su caso")
}
async function IA_ReservaPreciosDisponibilidad(mensaje_turista,flowDynamic,ctx){
    let informacion="Para temas de reservas, consulta de precios y disponibilidad del piso puede realizarlo a traves de nuestra pagina web : www.homestaymadrid.com"
    nombre_turista=ctx.pushName
    respuesta= await IA_RESERVA.handleMsgChatGPT(ctx.from,`informacion=${informacion},mensaje_turista=${mensaje_turista},nombre_turista=${nombre_turista},previous_message=${customersPhone.secondMessage}`)
    await flowDynamic(respuesta.text)
}
async function IA_EMB_OTROTIPOINFORMACIONES(mensaje_recibido,flowDynamic,ctx){
    let top_n_mejores=5
    const pythonProcess = spawn('py', [path.join(__dirname,
        `Emb.py`),mensaje_recibido,"OTI.csv",top_n_mejores]);
    pythonProcess.stdout.on('data', async (data) => {
        const informacion=data.toString()
        //Se envia las variables a gpt3.5 para que en base al contenido
        respuesta= await IA_OTI.handleMsgChatGPT(ctx.from,`informacion=${informacion},mensaje_turista=${mensaje_recibido},previous_message=${customersPhone.secondMessage}`)
        console.log("IA_OTI",respuesta.detail.usage.total_tokens)
        console.log(informacion)
        async (respuesta)=>
            console.log("Costo IA_EMB_OTI:",respuesta.detail.usage.total_tokens," Busquedas realizadas:",top_n_mejores)
            respuesta=respuesta.text//Solo queremos el contenido de la respuesta
            await flowDynamic(respuesta);//envias la respuesta                         
        }); 
}
async function IA_EMB_INFORMAPISOS(message_tourist,flowDynamic,nombrePiso,abc,ctx,top_n_mejores){
    let nombre_piso=nombrePiso+".csv";
    console.log("Nombre del piso",nombre_piso)
    const pythonProcess = spawn('py', [path.join(__dirname,
        `Emb.py`),message_tourist,nombre_piso,top_n_mejores]);
    pythonProcess.stdout.on('data', async (data) => {
        let information=data.toString()
        //Se envia las variables a gpt3.5 para que en base al contenido
        respuesta= await IA_DDD.handleMsgChatGPT(ctx.from,`information=${information},mensaje_turista=${message_tourist}`)
        console.log("Costo IA_EMB_DDD:",respuesta.detail.usage.total_tokens,"BUSQUEDAS REALIZADAS:",top_n_mejores)
        respuesta=respuesta.text//Solo queremos el contenido de la respuesta
        await flowDynamic(respuesta);//envias la respuesta
        await BuscarDireccionEstatica(abc,ctx,respuesta);
        await BuscaImagenes(abc,ctx,respuesta);     
    }); 
}

async function IA_AGENTEHUMANO(mensaje_turista,ctx,provider,flowDynamic){
    //Falta implementar que se apague el bot al usuario y que se le notifique 
    //al numero del encargado sobre el acontecimiento
    EnviaMensaje(ctx,provider,customersPhone[ctx.from])
    informacion=`Entiendo su preocupacion, en unos momentos se comunicara el agente encargado con usted
    O ponerse en contacto con: 
    Meryem  (Horario de Oficina) +34 630637831 
    José  (Horarios Nocturos) +34 601242791 
    Jeampierre (Emergencias) +34 601153095 
    Dirección de la oficina: Calle Vicente Camarón 62, Local IZQ, CP 28011, Madrid.
    Correo: contacto@homestaymadrid.com
    Reservas en: www.homestayMadrid.com`
    const nombre_turista=ctx.pushName
    respuesta= await IA_RESERVA.handleMsgChatGPT(ctx.from,`informacion=${informacion},mensaje_turista=${mensaje_turista},nombre_turista=${nombre_turista}`)
    console.log("Costo IA_HomeStay:",respuesta.detail.usage.total_tokens)
    respuesta=respuesta.text//Solo queremos el contenido de la respuesta
    await flowDynamic(respuesta);//envias la respuesta
}
async function IA_DESPEDIDA(tourist_mesagge,flowDynamic,tourist_name,ctx){
    // *GR28*  => Piso con capacidad desde 2 hasta 5 personas 3 Habitaciones.
    //*VC58*  => Piso con capacidad desde 2 hasta  6 personas 1 Habitacion.
    //Se envia las variables a gpt3.5 para que en base al contenido     
        respuesta= IA_DESP.handleMsgChatGPT(ctx.from,`tourist_name=${tourist_name},tourist_mesagge=${tourist_mesagge},previous_message=${customersPhone.secondMessage}`)
        .then(async (respuesta)=>{
            console.log("Costo IA despedida: ",respuesta.detail.usage.total_tokens)
            respuesta=respuesta.text//SoCostolo queremos el contenido de la respuesta
            await flowDynamic(respuesta);//envias la respuesta
        })                         
}
async function IA_Saludo(mensaje_turista,flowDynamic,nombre_turista,ctx,provider){
    const abc = await provider.getInstance();
    let top_n_mejores=1
    const pythonProcess = spawn('py', [path.join(__dirname,
        `Emb.py`),mensaje_turista,"IHS.csv",top_n_mejores]);
    pythonProcess.stdout.on('data', async (data) => {
        let informacions_obtenida=data.toString()+floorBasicDescription 
        //console.log(informacions_obtenida)
        //Se envia las variables a gpt3.5 para que en base al contenido
        respuesta= await IA_HomeStay.handleMsgChatGPT(ctx.from,
            `nombre_turista=${nombre_turista},
            mensaje_turista=${mensaje_turista},
            informacion_obtenida=${informacions_obtenida},
            previous_message=${customersPhone.secondMessage}`
        )
        console.log("Costo IA HomeStay: ",respuesta.detail.usage.total_tokens)
        respuesta=respuesta.text//SoCostolo queremos el contenido de la respuesta
        if(respuesta.match(floorCode)){
            customersPhone[ctx.from].intentionFloor = respuesta.match(floorCode)[0];
            respuesta = respuesta.replace(/¿.*?\?/g, '');
        }


        // Dividir el mensaje en párrafos usando el salto de línea como separador
        const parrafos = respuesta.split('\n\n');
        // Enviar cada párrafo como un mensaje individual
        for (const parrafo of parrafos) {
            if (parrafo.trim() !== "") {
                const mensaje = {
                    text: parrafo.trim()
                };
                await abc.sendMessage(ctx.key.remoteJid, mensaje);
            }
        }
        
        let IncluyePiso= floorCode.test(respuesta);
        console.log(IncluyePiso)
        if(IncluyePiso){
            let message=`*Si quiere informacion especifica de un piso (fotos,videos,ubicacion,comollegar,etc), hagalo indicando su codigo por favor*`
            let answer=await IA_TRADUCTOR.handleMsgChatGPT(`message=${message},language=${customersPhone[ctx.from].language}`)

            await abc.sendMessage(ctx.key.remoteJid,{text:`*${answer.text}*`});
        }   
    });                     
}
//FUNCIONES DE NIVEL 2

async function IA_EMB_GENERAL(message_received,flowDynamic,nombre_turista,ctx,provider){
    const intention = await IA_DDI4.handleMsgChatGPT(`message_received=${message_received}`);
    console.log("Costo IA_DDI4:",intention.detail.usage.total_tokens,"Intecion:",intention.text)
    if (["A1","A2","A3","A4","A5"].includes(intention.text)){
        IA_Saludo(message_received,flowDynamic,nombre_turista,ctx,provider)              
    }
    else if (["B1","B2"].includes(intention.text)){
        IA_DESPEDIDA(message_received,flowDynamic,nombre_turista,ctx)
    }
}

async function IA_EMB_InformacionPisosEspecifica(intentionFlow,intentionFloor,message_received,flowDynamic,abc,ctx){
    //Se envia las variables a gpt3.5 para que en base al contenido
    let top_n_mejores=4
    let IncluyePiso= floorCode.test(message_received);
    if(IncluyePiso!=true){
        message_received=`${message_received}, me refiero a: ${intentionFloor}`
        console.log("MENSAJE RECIBIDO MODIFICADO",message_received)
        intention= await IA_DDI2.handleMsgChatGPT(`message_received=${message_received}`)
    }
    else{
        intention= await IA_DDI2.handleMsgChatGPT(`message_received=${message_received}`)
    }
    console.log("mensaje recibido:",message_received)
    //console.log("Intention:",intention.text)
    console.log("Costo IA_DDI2: ",intention.detail.usage.total_tokens," Intencion: ",intention.text)
    if(intention.text.includes("AA")){
        intentionFloor=undefined
        intentionFlow=1
        IA_EMB_GENERAL(message_received, flowDynamic,ctx.pushName,ctx,provider)
    }
    else if(intention.text.includes("BB")) intentionFloor="BN10"
    else if(["CCA","CCB","CCC"].includes(intention.text)){
        //console.log("Mensaje Cliente",message_received)
        let subpisos=`
        Categoria AA-Informacion del piso "HP10"
        Categoria BB-Informacion del piso "HPA1"
        Categoria CC-Informacion del piso "HPB2`
        intention2= await IA_ESP.handleMsgChatGPT(ctx.from,`message_received=${message_received},subpisos=${subpisos}`)
        console.log("Costo IA_ESP: ",intention2.detail.usage.total_tokens," Intention: ",intention2.text)
        if(intention2.text.includes("AA")){
            top_n_mejores=5
            intentionFloor="HP10"
        }
        else if(intention2.text.includes("BB"))intentionFloor="HPA1"
        else if(intention2.text.includes("CC"))intentionFloor="HPB2"
    } 
    else if(intention.text.includes("DD")) intentionFloor="LP05"
    else if(intention.text.includes("EE")) intentionFloor="VC58"
    else if(intention.text.includes("FF")) intentionFloor="PO109"
    else if(intention.text.includes("GG")) intentionFloor="VC62"
    else if(intention.text.includes("HH")) intentionFloor="PE154"
    else if(intention.text.includes("II")) intentionFloor="GR28"
    else if(intention.text.includes("MM")){
        IA_EMB_OTROTIPOINFORMACIONES(message_received,flowDynamic,ctx)
        return {intentionFlow,intentionFloor}
    }
    if(intention.text.includes("NN")){
        let info= `Alquileres de 1 Habitacion:
Codigo: *HPB2*  => Piso con capacidad desde 1 hasta 4 perssonas.
Codigo: *BN10*  => Piso con capacidad desde 1 hasta 4 personas .
Codigo: *VC62*  => Habitaciones con capacidad desde 1 hasta 3 personas.
Codigo: *PE154* => Habitaciones con capacidad desde 1 hasta 3 personas.
Codigo: *VC58*  => Piso con capacidad desde 2 hasta 5 personas.

Alquileres de 2 Habitacion:
Codigo: *HPA1*  => Piso con capacidad desde 2 hasta 6 personas .
Codigo: *LP05*  => Piso con capacidad desde 2 hasta  6 personas.
Codigo: *GR28*  => Piso con capacidad desde 2 hasta 5 personas.

Alquileres de 3 Habitacion:
Codigo: *HP10*  => Piso con capacidad desde 4 hasta 10 personas .
Codigo: *PO109* => Piso con capacidad desde 3 hasta  8 personas .
`
        await flowDynamic("Lo siento, el codigo del piso que ha mencionado no se encuentra en nuestra lista de pisos\nPisos Disponibles:\n"+info)
    }
    else{
        IA_EMB_INFORMAPISOS(message_received,flowDynamic,intentionFloor,abc,ctx,top_n_mejores) 
    }
    return {intentionFlow,intentionFloor}
}

async function BOT_OtroTipoDeIntenciones(message_received,flowDynamic,ctx,provider,flowDynamic){
    intention=await IA_DDI3.handleMsgChatGPT(`message_received=${message_received}`)
        .then(async (intention)=>{
            text=intention.text
            console.log("COSTO IA_DDI3:",intention.detail.usage.total_tokens,"Intecion:",text)
            if(text.includes("A1"))//Intencion de objetos perdidos
                BOT_ObjetosPerdidos(message_received,ctx,provider,flowDynamic)
            else if(text.includes("B1"))//Intencion de rebaja, regateo o algun tipo de descuento
                BOT_RebajaRegateoDescuento(message_received,ctx,provider,flowDynamic)
            else if(text.includes("C1"))//Intencion reserva, Precios o disponibilidad de los pisos
                IA_ReservaPreciosDisponibilidad(message_received,flowDynamic,ctx)
            else if(text.includes("D1")||text.includes("D2")||text.includes("D3")||text.includes("D4")){
                IA_EMB_OTROTIPOINFORMACIONES(message_received,flowDynamic,ctx)
            }
    })
}

//FUNCIONES DE NIVEL 1
async function IntencionesPrincipales(intentionFlow, intentionFloor, message_received, flowDynamic, abc, ctx,provider) {
    await fakeMessage(ctx,provider);
    const intention = await IA_DDI1.handleMsgChatGPT(`message_received=${message_received}`);
    console.log("Costo IDDD1:",intention.detail.usage.total_tokens,"Intecion:",intention.text)
    if (["A1","A2","A3","A4","A5","A6","A7","A8","A9"].includes(intention.text)){
        console.log(intention.text)
        IA_EMB_GENERAL(message_received, flowDynamic,ctx.pushName,ctx,provider)
    } else if (["B1","B2","B3"].includes(intention.text)) {
        intentionFlow = 2; // cambiar flujo
        const result=await IA_EMB_InformacionPisosEspecifica(intentionFlow, intentionFloor, message_received, flowDynamic,abc,ctx);
        intentionFlow = result.intentionFlow;
        intentionFloor = result.intentionFloor;
    } else if (["C1","C2","C3","C4"].includes(intention.text)) {
        BOT_OtroTipoDeIntenciones(message_received, flowDynamic, ctx, provider, flowDynamic);
    }
    else if (["D1","D2","D3","D4"].includes(intention.text)) {
        IA_AGENTEHUMANO(message_received, ctx, provider, flowDynamic);
    }
    return {intentionFlow,intentionFloor}
}

async  function IntencionesDePisos(intentionFlow,intentionFloor,mensaje_recibido,flowDynamic,abc,ctx,provider){
    await fakeMessage(ctx,provider);
    intention=await IA_RF1.handleMsgChatGPT(ctx.from,`mensaje_recibido=${mensaje_recibido+intentionFloor}`)
    console.log("Costo IA_RF1:",intention.detail.usage.total_tokens," Intencion: ",intention.text)
    let text=intention.text
    if(["B1","B2","B3","B4","B5"].includes(text)){
        intentionFlow=1
    }
    else if(["A1","A2","A3","A4","A5"].includes(text))
        IA_EMB_InformacionPisosEspecifica(intentionFlow,intentionFloor,mensaje_recibido,flowDynamic,abc,ctx)
    return {intentionFlow,intentionFloor}
}

//FLOW MAIN
function asignaMensaje(customersPhone,ctx){
    if(customersPhone[ctx.from].firstMessage===undefined)customersPhone[ctx.from].firstMessage=ctx.body
    else if(customersPhone[ctx.from].secondMessage===undefined)customersPhone[ctx.from].secondMessage=ctx.body
    else if(customersPhone[ctx.from].lastMessage===undefined)customersPhone[ctx.from].lastMessage=ctx.body
    else {
        customersPhone[ctx.from].firstMessage=customersPhone[ctx.from].secondMessage
        customersPhone[ctx.from].secondMessage=customersPhone[ctx.from].lastMessage
        customersPhone[ctx.from].lastMessage=ctx.body
    }
    
}
const flowMain = addKeyword(EVENTS.WELCOME)
    .addAction(
        async (ctx,{flowDynamic,provider})=>{
            inicializarNumerosTelefonico(ctx,customersPhone)
            const abc = await provider.getInstance();//Se obtiene la instancia del proovedor
            let mensaje_recibido=ctx.body.toString().toUpperCase()//Se obtiene el mensaje del cliente
            console.log((customersPhone[ctx.from].language===undefined))
            if(customersPhone[ctx.from].language===undefined){
                let message= await IA_DI.handleMsgChatGPT(`mensaje=${mensaje_recibido}`)
                customersPhone[ctx.from].language =message.text;
            }
            mensaje_recibido+=". Answer me in " +customersPhone[ctx.from].language
            console.log(mensaje_recibido)
            asignaMensaje(customersPhone,ctx)
            //Este if puede cambiar el estado a 1
            console.log("========================INICIO==========================")
            if(customersPhone[ctx.from].intentionFlow==2){
                const result=await IntencionesDePisos(customersPhone[ctx.from].intentionFlow,
                    customersPhone[ctx.from].intentionFloor,mensaje_recibido,flowDynamic,abc,ctx,provider)
                customersPhone[ctx.from].intentionFlow =result.intentionFlow
                customersPhone[ctx.from].intentionFloor =result.intentionFloor
            }
            else customersPhone[ctx.from].intentionFlow=1
            //Este if puede cambiar el estado a 2
            if(customersPhone[ctx.from].intentionFlow==1){
                const result=await IntencionesPrincipales(customersPhone[ctx.from].intentionFlow,
                    customersPhone[ctx.from].intentionFloor,mensaje_recibido,flowDynamic,abc,ctx,provider)
                customersPhone[ctx.from].intentionFlow =result.intentionFlow
                customersPhone[ctx.from].intentionFloor =result.intentionFloor
            }
            console.log("INTENCION DE FLUJO: ",customersPhone[ctx.from].intentionFlow)
            console.log(customersPhone)
        }
    )
module.exports = flowMain;