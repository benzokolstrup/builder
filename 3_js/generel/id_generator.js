// Function that generates a random ID based with a '-' every 6 charracter
// Should experiment with export/import
// Key learning here is: 
// How to get characters using charCodes
// Added two arrays together with the .concat() method
// Getting a variable value based of the result from a callback function
// Adding extra characters on specific iteration of a for loop
function generateId(){
    const idCharCodes = [];
    const idLength = 24;
    function arrayFromLowToHigh(low, high){
        const array = []
        for(let i = low; i <= high; i++){
            array.push(i);
        }
        return array;
    }
    const ID_CHAR_CODES = arrayFromLowToHigh(48, 57).concat(arrayFromLowToHigh(65, 90)).concat(arrayFromLowToHigh(97, 122));
    for(let i = 0; i < idLength; i++){
        const randomCharCode = ID_CHAR_CODES[Math.floor(Math.random() * ID_CHAR_CODES.length)];
        if (i && (i % 6 == 0)) idCharCodes.push('-');
        idCharCodes.push(String.fromCharCode(randomCharCode));
    }
    return idCharCodes.join('');
}