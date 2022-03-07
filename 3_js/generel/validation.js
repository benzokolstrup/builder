// Input verification
// Select the whole value when input is in focus
document.querySelectorAll('.creator input').forEach(input => {
    input.addEventListener('focusin', () =>{
        input.select();
    });
});
// Added an event that verifies the user input in the Creator sidebar module
document.querySelectorAll('[data-creatorModule] input').forEach(input => {
    input.addEventListener('input', () => {
        // Specific verification for inputs that should only contain numbers 
        if(input.hasAttribute('data-onlyNumber')){
            // Only numbers allowed
            input.value = input.value.replace(/[^0-9]/g, '');
            // Replace 0 if value starts with 0 and is has 2 or more characters
            if(input.value.match(/^0/) && input.value.length >= 2) input.value = input.value.replace(/^0/, '');
        }
        // Specific verification for inputs that should only contain colors in HEX
        if(input.hasAttribute('data-onlyHex')){
            // Transform value to lower case and don't allow invalid HEX code characters 
            input.value = input.value.toLowerCase();
            input.value = input.value.replace(/[^0-9a-f]/g, '');
        }
    });
    // Added final verification check when you leave an input
    input.addEventListener('focusout', () => {
        verifyInputs();
    });
});

// Makes sure that inputs are not empty and that they contain a valid value
function verifyInputs(){
    document.querySelectorAll('[data-onlyNumber]').forEach(input => {
        // If empty set value to 0
        if(input.value == '') input.value = '0';
    });
    document.querySelectorAll('[data-onlyHex]').forEach(input => {
        // If input is 0 set it to a default
        if(input.value.length == 0) input.value = 'efefef';
        // If the value only has same characters, fill the value with that character. Example: ff = ffffff
        if(input.value.split('').every((char, i, hexArray) => char === hexArray[0])) input.value = input.value.split('')[0].repeat(6);
        // If the value has 2 characters, print those 3 times. Example: fe = fefefe
        if(input.value.length == 2) input.value = input.value.repeat(3);
        // If the input has 3 characters, add 2 of every character. Example: 4ad = 44aadd
        if(input.value.length >= 3 && input.value.length < 6) input.value = input.value.replace(/([0-9a-f])([0-9a-f])([0-9a-f]).*/,'$1$1$2$2$3$3');
    }
)};