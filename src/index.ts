/// <reference path="../node_modules/@workadventure/iframe-api-typings/iframe_api.d.ts" />
import { getLayersMap, bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

// Waiting for the API to be ready
WA.onInit().then(async () => {

    let layers = await getLayersMap();
    console.log('Current player name : ', WA.player.name);
    console.log(layers);

    layers.forEach((layer, key) => {
        if (layer && layer.properties) {
            layer.properties.forEach(prop => {
                if (prop.name === 'popupMessage') {
                    let config: {targetZone: string, content: string} | undefined = undefined;
                    try {
                        config = JSON.parse(prop.value);
                        if (config && config?.targetZone && config?.content) {
                            WA.room.onEnterLayer(key).subscribe(openPopup(config.targetZone, config.content));
                            WA.room.onLeaveLayer(key).subscribe(closePopUp);
                        }
                    } catch(error) {
                        /* silent error */
                    }
                }
            });
        }
    });

    WA.room.onEnterLayer('clockZone').subscribe(() => {
        const today = new Date();
        const time = today.getHours() + ":" + today.getMinutes();
        currentPopup = WA.ui.openPopup("clockPopup","It's " + time,[]);

        const sound = WA.sound.loadSound('https://ia902701.us.archive.org/35/items/3ah2008-08-08.ka500.603a.722.flac24/3ah2008-08-08.ka500.603a.2444.set1.t03_Rush_Hour.mp3');
        sound.play({});
    })

    WA.room.onLeaveLayer('clockZone').subscribe(closePopUp)

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));
    
}).catch(e => console.error(e));

function closePopUp(){
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
}

function openPopup(zone: string, content: string) {
    return () => {
        if (currentPopup !== undefined) {
            closePopUp();
        }
        currentPopup = WA.ui.openPopup(zone,content,[]);
    };
}
