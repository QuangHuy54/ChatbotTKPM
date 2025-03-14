import { Timestamp } from "firebase/firestore";

function convertTimeToTimeString(time: Timestamp | Date | string):string {
    if (typeof time == "string")
        return time;
    if (time.constructor === Date)
        return time.getDate() + "/" + (time.getMonth() + 1) + "/" + time.getFullYear();   

    if (time.constructor === Timestamp) {
        return convertTimeToTimeString(new Date(time.seconds * 1000)); 
    }

    return "N/A";    
}

export default convertTimeToTimeString