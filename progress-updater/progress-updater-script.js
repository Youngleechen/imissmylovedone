// Get the post button element
const postButton = document.getElementById('postButton');

// Add click event listener to the post button
postButton.addEventListener('click', function() {
    console.log('Share Progress button clicked');
    
    // You can add more functionality here, such as:
    // - Getting the text from the textarea
    const memoryBody = document.getElementById('memory-body');
    const progressText = memoryBody.value;
    console.log('Progress text:', progressText);
    
    // - Triggering the posting logic
    // postProgress(progressText);
});
