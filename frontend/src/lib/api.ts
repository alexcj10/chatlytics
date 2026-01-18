export async function analyzeChat(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to analyze chat');
    }

    return response.json();
}
