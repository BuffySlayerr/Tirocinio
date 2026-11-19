import { Twin } from "./twin";
import TDbase from "./td";

(async () => {
    try {

        const thing = await WoT.produce(TDbase)
        console.log("Produced " + thing.getThingDescription().title);
        const logic = new Twin(thing)
        thing.expose()
    } catch (err) {
        console.log(err);
    }
})();