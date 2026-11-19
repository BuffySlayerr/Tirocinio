import { Room } from "./room";
import TDbase from "./td";

(async () => {
    try {

        const thing = await WoT.produce(TDbase)
        console.log("Produced " + thing.getThingDescription().title);
        const logic = new Room(thing)
        thing.expose()
    } catch (err) {
        console.log(err);
    }
})();