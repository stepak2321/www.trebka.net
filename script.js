// Function to execute commands
function executeTerminalCommand(command) {
    switch (command) {
        case 'balls':
            console.log('Redirecting to c.trebka.net');
            window.location.href = 'http://c.trebka.net'; // Redirecting to the website
            break;
        // other cases
        default:
            console.log('Unknown command');
    }
}