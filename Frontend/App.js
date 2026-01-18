import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';
import './App.css';

function App() {
  const [editorContent, setEditorContent] = useState('');
  const quillRef = useRef(null);

  // Custom image handler
  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await axios.post('http://localhost:5000/api/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = res.data.url;

        // Insert image into editor
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', url);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Image upload failed: ' + (error.response?.data?.error || 'Unknown error'));
      }
    };
  };

  // Quill modules config
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: { image: handleImageUpload } // Override default image handler
    }
  };

  // Handle editor change
  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

 const handleSubmit = async () => {
  if (!editorContent.trim()) {
    alert('Please write something first!');
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/api/save-post', {
      title: 'My Awesome Post', //  you can make this dynamic later
      content: editorContent,
    });

    console.log('Save success:', response.data);
    alert('Post saved successfully! ID: ' + (response.data.id || 'unknown'));
    // Optional: clear editor
    setEditorContent('');
  } catch (error) {
    console.error('Full save error:', error);

    let errorMessage = 'Unknown error';

    if (error.response) {
      // Server responded with error status (400, 500, etc.)
      errorMessage = error.response.data?.error 
        || error.response.data?.message 
        || `Server error (${error.response.status})`;
    } else if (error.request) {
      // No response received (network issue, CORS, server down)
      errorMessage = 'No response from server. Is backend running?';
    } else {
      errorMessage = error.message;
    }

    alert('Failed to save: ' + errorMessage);
  }
};

  return (
    <div className="app-container">
      <div className="editor-box">
        <h2>Editor</h2>
        <ReactQuill
          ref={quillRef}
          value={editorContent}
          onChange={handleEditorChange}
          modules={modules}
          theme="snow"
        />
      </div>
      <div className="preview-box">
        <h2>Preview</h2>
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: editorContent }}
        />
      </div>
      <button onClick={handleSubmit} className="submit-button">
        Submit HTML
      </button>
    </div>
  );
}

export default App;