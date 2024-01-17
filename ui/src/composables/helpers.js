//helpers.js

import { Timestamp } from 'firebase/firestore';
// Function to generate a random UID
export function generateUID() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Function to convert date string to JS date object
export function convertDate(dateString) {
    if (typeof dateString === 'string') {
        let [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day);
    }
    throw new Error('Invalid date string');
}

// Function to format date object to string
export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Function to convert JS date object to firebase timestamp
export function convertTimestamp(date) {
    return Timestamp.fromDate(date);
}

// Function to get the media platform based on the url
export function getPlatform(url) {
    // Prepend 'https://' if it's missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    //get platform from url
    const hostname = new URL(url).hostname;
    if (hostname.includes('youtube.com')) {
        return 'youtube';
    } else if (hostname.includes('vimeo.com')) {
        return 'vimeo';
    } else {
        return '';
    }
}