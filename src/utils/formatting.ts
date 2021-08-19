export function formatDuration(duration: number, long: boolean = false) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration - (hours * 3600)) / 60);
    const seconds = Math.floor(duration - ((minutes * 60) + (hours * 3600)));

    if (long) {
        let out = '';
        if (hours > 0) out += `${hours} hour${hours > 1 ? 's' : ''} `;
        if (minutes > 0) out += `${minutes} minute${minutes > 1 ? 's' : ''} `;
        if (seconds > 0) out += `${seconds} second${seconds > 1 ? 's' : ''}`;
        return out;
    }
    
    let out = '';
    if (hours > 0) out += `${hours}:`;
    out += `${minutes}:`.padStart(2, '0');
    out += `${seconds}`.padStart(2, '0');
    return out;
}