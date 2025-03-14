import { Timestamp } from "firebase/firestore";

function convertTimeToString(time: Timestamp | Date | string):string {
    if (typeof time == "string")
        return time;
    if (time.constructor === Date)
        return "Ngày " + time.getDate() + " tháng " + (time.getMonth() + 1) + " năm " + time.getFullYear();   

    if (time.constructor === Timestamp) {
        const seconds = Timestamp.now().seconds - time.seconds;
        if (seconds < 60) return "Mới đây";
    
        const minutes = seconds / 60;
        if (minutes < 60) return Math.floor(minutes) + " phút trước";

        const hours = seconds / 3600;
        if (hours < 24) return Math.floor(hours) + " giờ trước"

        return convertTimeToString(new Date(time.seconds * 1000)); 
    }

    return "N/A";    
}

export default convertTimeToString