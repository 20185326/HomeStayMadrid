async function BuscaImagenes(abc,ctx,respuesta){
    //Inicio de deteccion de contenido multimedia
    const regexLinks = /https:\/\/8mc4\.short\.gy\/Media\/[\wáéíóúüñ]+\d+(?:\w+)?/g;
    let linksSet = new Set(); 
    let match;
    while ((match = regexLinks.exec(respuesta)) !== null) {
        linksSet.add(match[0]);
    }
    const links = [...linksSet];
    if (links !== null && links.length !== 0){
        const regexNombres = /\/([^\/]+)$/i;
        const nombres = [];
        for (let i = 0; i < links.length; i++) {
            const match = links[i].match(regexNombres);
            nombres.push(match[1])
        }
        for(i=0;i<links.length;i++){
            let jid = ctx.key.remoteJid
            if(!nombres[i].includes("Video")){
                await abc.sendMessage(jid,{image: { url: links[i] } });
            }
            else {
                await abc.sendMessage(jid,{video: { url: links[i] } });
            }
        }
    }
    //Fin de deteccion de contenido multimedia
}
function getCoordinates(){
    const coordinates = {
        GpsLP05: {lat: 40.4066,long: -3.7446},
        GpsVC62: {lat: 37.3891,long: -5.9845},
        GpsPO109: {lat: 40.4055209,long: -3.7409898},
        GpsBN10B0: {lat: 40.4065511,long: -3.7414724},
        GpsPE157: {lat: 40.4101135,long: -3.7395072},
        GpsHP10: {lat: 40.4098721,long: -3.737745},
        GpsPE154: {lat:40.4099329,long:-3.7388064},
        GpsGR28: {lat:40.3961,long:-3.71926},
        GpsVC58: {lat:40.4062786,long:-3.7409}
    };
    return coordinates
}
async function BuscarDireccionEstatica(abc,ctx,respuesta){
    //Inicio de deteccion de direcciones estaticas
    const regexLinks = /https:\/\/8mc4\.short\.gy\/Ubicacion\/[\wáéíóúüñ]+\d+/g;
    const regexNombres = /\/([^\/]+)$/i;
    let linksSet = new Set(); 
    let match;
    while ((match = regexLinks.exec(respuesta)) !== null) {
        linksSet.add(match[0]);
    }
    const links = [...linksSet];
    if (links !== null && links.length !== 0){
        const nombres = [];
        const coordinates=getCoordinates();
        for (let i = 0; i < links.length; i++) {
            const match = links[i].match(regexNombres);
            nombres.push(match[1])
        }
        for(i=0;i<links.length;i++){
            let jid = ctx.key.remoteJid
            if(nombres[i].includes("Gps")){
                const lat=coordinates[nombres[i]].lat;
                const long=coordinates[nombres[i]].long;
                await abc.sendMessage(jid,
                    { location: { degreesLatitude:lat, degreesLongitude:long } })
            }
        }
    }
};
module.exports={BuscaImagenes,BuscarDireccionEstatica}