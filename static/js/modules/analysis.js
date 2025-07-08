export function setupImageAnalysis() {
    const form = document.getElementById('analysis-form');
    const resultDiv = document.getElementById('analysis-result');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('/analyze/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Analysis failed');
            const data = await response.json();
            
            // Clear previous results and buttons
            clearPreviousResults();
            
            displayAnalysisResults(data);
            createDownloadButtons(data.output_json,data['Blurred Image URL']);
        } catch (error) {
            showError(error.message);
        }
    });

    // Clear previous results and download buttons
    function clearPreviousResults() {
        resultDiv.innerHTML = '';
        const existingButtons = document.getElementById('download-buttons-container');
        if (existingButtons) {
            existingButtons.remove();
        }
    }
    window.handleBlurClick = handleBlurClick;
    
    function displayAnalysisResults(data) {
        resultDiv.innerHTML = `
            <div class="space-y-4">
                ${data['Blurred Image URL'] ? createImageSection(data['Blurred Image URL']) : ''}
                ${createMetadataSection(data['Extracted Metadata'])}
                ${createNSFWSection(data['NSFW Data'])}
                ${createObjectsSection(data['Detected Objects'])}
                ${createAnalysisSection(data['Detailed Risk Analysis'])}
            </div>
        `;
    }

    function showError(message) {
        resultDiv.innerHTML = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                Analysis failed: ${message}
            </div>
        `;
    }
}

function createImageSection(url) {
    return `
        <div class="mb-4">
            <h4 class="font-semibold mb-2">Annotated Image:</h4>
            <img src="${url}" alt="Annotated Image" class="max-w-full h-auto rounded-lg shadow-md">
            
            <div class="mt-4">
                <div class="flex gap-2">
                    <input 
                        type="text" 
                        id="regionInput" 
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Blur Regions: (Ex: 5 7 8)"
                    >
                    <button 
                        onclick="handleBlurClick(document.getElementById('regionInput').value)"
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Blur and Download Image
                    </button>
                </div>
                <div id="routerResult" class="mt-2 text-sm text-gray-600"></div>
            </div>
        </div>
    `;
}

function createMetadataSection(metadata) {
    return `
        <div>
            <h4 class="font-semibold">Extracted Metadata:</h4>
            <p class="text-gray-700">${metadata}</p>
        </div>
    `;
}

function createNSFWSection(metadata) {
    return `
        <div>
            <h4 class="font-semibold">Extracted NSFW Score:</h4>
            <p class="text-gray-700">${metadata}</p>
        </div>
    `;
}

function createObjectsSection(objects) {
    return `
        <div>
            <h4 class="font-semibold">Detected Objects:</h4>
            <pre class="bg-blue-500 p-2 rounded">${JSON.stringify(objects, null, 2)}</pre>
        </div>
    `;
}

function createAnalysisSection(analysis) {
    const sections = analysis.split('**').filter(Boolean);
    let formattedHTML = '<div class="content-analysis p-6 space-y-6">';

    for (let i = 0; i < sections.length; i += 2) {
        const title = sections[i].trim();
        const content = sections[i + 1]?.trim() || '';

        // Format numbered lists and handle plain paragraphs
        let formattedContent = '';
        const lines = content.split('\n');

        if (lines.some(line => /^\d+\./.test(line))) {
            // If numbered list detected, format as <ol>
            formattedContent += '<ol class="space-y-2">';
            lines.forEach(line => {
                if (/^\d+\./.test(line)) {
                    formattedContent += `<li class="ml-6 list-decimal">${line.replace(/^\d+\.\s*/, '')}</li>`;
                } else {
                    formattedContent += `<li class="ml-6 list-decimal">${line}</li>`;
                }
            });
            formattedContent += '</ol>';
        } else {
            // Otherwise, treat as plain paragraphs
            formattedContent = lines
                .map(line => `<p class="text-gray-700 whitespace-pre-line">${line}</p>`)
                .join('');
        }

        // Create a section with the title and formatted content
        formattedHTML += `
            <section class="analysis-section">
                <h3 class="highlight-text text-xl font-bold mb-3">${title}</h3>
                ${formattedContent}
            </section>
        `;
    }

    formattedHTML += '</div>';
    return formattedHTML;
}

    


   

function createDownloadButtons(outputJson,url) {
    // Remove any existing download buttons
    const existingButtons = document.getElementById('download-buttons-container');
    if (existingButtons) {
        existingButtons.remove();
    }

    // Parse the JSON if it's a string
    const output = typeof outputJson === 'string' ? JSON.parse(outputJson) : outputJson;
    const imagePath = url || null;

    // Create a container for the buttons
    const container = document.createElement('div');
    container.id = 'download-buttons-container';
    container.className = 'flex gap-2 mt-4 justify-center';

    // Create Download JSON button
    const jsonButton = document.createElement('button');
    jsonButton.textContent = 'Download JSON';
    jsonButton.className = 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded';
    jsonButton.onclick = () => {
        const jsonBlob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
        downloadFile('report.json', jsonBlob);
    };
    container.appendChild(jsonButton);

    // Create Download TXT button
    const txtButton = document.createElement('button');
    txtButton.textContent = 'Download TXT';
    txtButton.className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded';
    txtButton.onclick = () => {
        const txtBlob = new Blob([formatAsText(output)], { type: 'text/plain' });
        downloadFile('report.txt', txtBlob);
    };
    container.appendChild(txtButton);

    // Create Download PDF button
    const pdfButton = document.createElement('button');
    pdfButton.textContent = 'Download PDF';
    pdfButton.className = 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded';
    pdfButton.onclick = () => {
        generatePDF(output,imagePath);
    };
    container.appendChild(pdfButton);

    // Append the container after the result div
    const resultDiv = document.getElementById('analysis-result');
    resultDiv.appendChild(container);
}

function generatePDF(data,imagePath) {
    const content = formatPDFContent(data, imagePath);
    const style = `
        .pdf-content {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
        }
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .content {
            font-size: 14px;
        }
        .image-container {
            margin: 20px 0 30px 0;
            page-break-inside: avoid;
        }
        .image-container img {
            max-width: 600px;
            max-height: 800px;
            width: auto;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .image-title {
            font-size: 14px;
            color: #666;
            text-align: center;
            margin-top: 8px;
        }
        @media print {
            .pdf-content {
                margin: 0;
                padding: 20px;
            }
            .image-container {
                margin-top: 0;
            }
        }
    `;

    const html = `
        <html>
            <head>
                <style>${style}</style>
            </head>
            <body>
                <div class="pdf-content">
                    <h1 style="text-align: center; margin: 0 0 20px 0;">Analysis Report</h1>
                    ${content}
                </div>
            </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

function formatPDFContent(data, imagePath) {
    let content = '<h1 style="text-align: center; margin-bottom: 30px;"> </h1>';
    
    // Add image section if image path is provided
    if (imagePath) {
        content += `
            <div class="image-container">
                <img src="${imagePath}" alt="Annotated Image">
                <div class="image-title">Annotated Image</div>
            </div>
        `;
    }
    
    for (const [key, value] of Object.entries(data)) {
        content += `
            <div class="section">
                <div class="section-title">${key}</div>
                <div class="content">
                    <pre style="white-space: pre-wrap;">${JSON.stringify(value, null, 2)}</pre>
                </div>
            </div>
        `;
    }
    
    return content;
}


// Helper to dynamically create a link and download files
function downloadFile(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Helper to format the data as plain text
function formatAsText(data) {
    let text = 'Detailed Report\n\n';
    text += Object.entries(data)
        .map(([key, value]) => `${key}:\n${JSON.stringify(value, null, 2)}`)
        .join('\n\n');
    return text;
}

async function handleBlurClick(textbox) {
    if (!checkNumberPattern(textbox)) {
        alert('Please select valid region to blur');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('regions', textbox);

        const response = await fetch('/blur-regions/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to blur regions');
        
        const blob = await response.blob();
        downloadBlurredImage(blob);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to blur and download image');
    }
}

function downloadBlurredImage(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blurred_image.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function checkNumberPattern(str) {
    // Handle empty string
    if (!str.trim()) return false;
    
    // Split by spaces and check if each part is a number
    return str.split(" ")
        .every(part => /^\d+$/.test(part));
}