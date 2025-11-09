// Import Supabase client from config
import { supabase } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    // Track pasted/dropped images
    let imageFiles = [];

    // Handle file input click
    dropArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('active');
    }

    function unhighlight() {
        dropArea.classList.remove('active');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle clipboard paste
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    handleFiles([file]);
                }
            }
        }
    });

    // Process and preview files
    function handleFiles(files) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-img';
                
                const removeBtn = document.createElement('button');
                removeBtn.textContent = '×';
                removeBtn.className = 'remove-btn';
                removeBtn.onclick = () => {
                    previewItem.remove();
                    imageFiles = imageFiles.filter(f => f !== file);
                    updateUploadButton();
                };
                
                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
                previewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
            
            imageFiles.push(file);
        }
        
        updateUploadButton();
    }

    function updateUploadButton() {
        uploadBtn.disabled = imageFiles.length === 0;
    }

    // Upload handler
    uploadBtn.addEventListener('click', async () => {
        const user = await checkAuth();
        if (!user) return;

        if (imageFiles.length === 0) return;

        uploadBtn.disabled = true;
        uploadProgress.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = 'Starting upload...';

        let successCount = 0;
        const totalFiles = imageFiles.length;

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const fileExt = file.name.split('.').pop() || 'png';
            const fileName = `${user.id}/${Date.now()}-${i}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

            try {
                const { error: uploadError } = await supabase.storage
                    .from('dev-updates-media')
                    .upload(fileName, file, {
                        upsert: false,
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            const overallPercent = Math.round(((i / totalFiles) * 100) + (percentCompleted / totalFiles));
                            progressFill.style.width = overallPercent + '%';
                            progressText.textContent = `Uploading ${file.name}... ${overallPercent}%`;
                        }
                    });

                if (uploadError) {
                    throw uploadError;
                }

                // Get public URL and add to development updates
                const { data: { publicUrl } } = supabase.storage
                    .from('dev-updates-media')
                    .getPublicUrl(fileName);

                // Add to development updates table
                const { error: insertError } = await supabase
                    .from('development_updates')
                    .insert({
                        author_id: user.id,
                        title: 'Image Upload',
                        body: `![Uploaded Image](${publicUrl})`,
                        created_at: new Date().toISOString()
                    });

                if (insertError) {
                    console.error('Insert error:', insertError);
                } else {
                    successCount++;
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert(`Failed to upload ${file.name}: ${error.message}`);
            }
        }

        // Reset state
        imageFiles = [];
        previewContainer.innerHTML = '';
        uploadBtn.disabled = false;
        uploadProgress.style.display = 'none';
        progressText.textContent = `Successfully uploaded ${successCount} of ${totalFiles} images!`;
        
        // Reload updates if needed
    });

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please sign in to upload images.');
            window.location.href = '../signin.html'; // Adjust path as needed
            return null;
        }
        return user;
    }
});
