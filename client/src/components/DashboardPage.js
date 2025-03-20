const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        setLoading(true);
        setError(null);

        console.log('Uploading file:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        const formData = new FormData();
        formData.append('image', file);

        // Log the FormData contents
        for (let pair of formData.entries()) {
            console.log('FormData entry:', pair[0], pair[1]);
        }

        const response = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('Server response:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to process image');
        }

        if (data.success) {
            setExtractedCode(data.code);
            setSecurityAnalysis(data.securityAnalysis);
            setImagePreview(URL.createObjectURL(file));
        } else {
            throw new Error(data.error || 'Failed to process image');
        }
    } catch (error) {
        console.error('Upload error:', error);
        setError(error.message);
    } finally {
        setLoading(false);
    }
}; 