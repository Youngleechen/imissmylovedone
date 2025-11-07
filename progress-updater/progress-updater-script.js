document.addEventListener('DOMContentLoaded', function() {
    // Get the post button element
    const postButton = document.getElementById('postButton');

    if (!postButton) {
        console.error('Post button not found! Check your HTML.');
        return;
    }

    // Add click event listener to the post button
    postButton.addEventListener('click', function() {
        console.log('Share Progress button clicked');

        // Getting the text from the textarea
        const memoryBody = document.getElementById('memory-body');
        const progressText = memoryBody?.value || '';
        console.log('Progress text:', progressText);

        // You can add more functionality here, such as:
        // postProgress(progressText);
    });
});
