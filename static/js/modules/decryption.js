export function setupDecryption() {
    const form = document.getElementById('decryption-form');
    const resultDiv = document.getElementById('decryption-result');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('/decrypt', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Decryption failed');
            }

            const blob = await response.blob();
            downloadFile(blob, response.headers.get('Content-Disposition'));
            showSuccess();
        } catch (error) {
            showError(error.message);
        }
    });

    function showSuccess() {
        resultDiv.innerHTML = `
            <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-4">
                File decrypted successfully!
            </div>
        `;
    }

    function showError(message) {
        resultDiv.innerHTML = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4">
                Decryption failed: ${message}
            </div>
        `;
    }
}

function downloadFile(blob, disposition) {
    const filename = disposition.split('filename=')[1];
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}