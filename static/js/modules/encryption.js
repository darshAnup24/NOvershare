export function setupEncryption() {
    const form = document.getElementById('encryption-form');
    const resultDiv = document.getElementById('encryption-result');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('/encrypt', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error(`HTTP error ${response.status}`);

            const blob = await response.blob();
            const salt = response.headers.get("X-Salt");
            
            downloadFile(blob, response.headers.get('Content-Disposition'));
            showSuccess(salt);
        } catch (error) {
            showError(error.message);
        }
    });

    function showSuccess(salt) {
        resultDiv.innerHTML = `
            <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-4">
                <p class="font-bold">File encrypted successfully!</p>
                <div class="flex items-center gap-2 mt-2">
                    <span>Salt: </span>
                    <code class="bg-green-50 px-2 py-1 rounded" id="salt-value">${salt}</code>
                    <button onclick="navigator.clipboard.writeText('${salt}')"
                            class="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition">
                        Copy
                    </button>
                </div>
            </div>
        `;
    }

    function showError(message) {
        resultDiv.innerHTML = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4">
                Encryption failed: ${message}
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