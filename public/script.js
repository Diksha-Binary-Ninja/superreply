document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  const fileInput = document.getElementById('voiceFile');
  formData.append('voiceFile', fileInput.files[0]);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    alert(result.message);
    localStorage.setItem('voiceFilePath', result.filePath);
  } catch (error) {
    alert('Error uploading file.');
  }
});

document.getElementById('synthesizeButton').addEventListener('click', async () => {
  const textInput = document.getElementById('textInput').value;
  const voiceFilePath = localStorage.getItem('voiceFilePath');

  if (!voiceFilePath || !textInput) {
    alert('Please upload a file and enter text.');
    return;
  }

  try {
    const response = await fetch('/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceFilePath, text: textInput }),
    });
    const result = await response.json();
    alert(result.message);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = `/download?filePath=${result.outputFilePath}`;
    downloadLink.style.display = 'block';
  } catch (error) {
    alert('Error synthesizing voice.');
  }
});
