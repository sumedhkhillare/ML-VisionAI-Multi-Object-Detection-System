import { useState } from "react";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [detectedImage, setDetectedImage] = useState(null);
  const [objects, setObjects] = useState([]);
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:5000";

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
    setDetectedImage(null);
    setObjects([]);
    setCounts({});
    setTotal(0);
  };

  const detectObjects = async () => {
    if (!selectedImage) {
      alert("Please upload an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/detect`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Detection failed");
        return;
      }

      setDetectedImage(`data:image/jpeg;base64,${data.image}`);
      setObjects(data.objects || []);
      setCounts(data.counts || {});
      setTotal(data.total || 0);
    } catch (error) {
      alert("Backend not running. Start Flask backend first.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (image, name) => {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = name;
    link.click();
  };

  const highestConfidence =
    objects.length > 0 ? Math.max(...objects.map((obj) => obj.confidence)) : 0;

  const topObject =
    Object.keys(counts).length > 0
      ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      : "None";

  return (
    <div className="app">
      <div className="page">
        <nav className="navbar">
          <div className="brand">
            <div className="brand-icon">ML</div>

            <div>
              <h3 className="project-title">
                <span>ML VisionAI</span>
                <span>Multi-Object</span>
                <span>Detection System</span>
              </h3>
              <p>Professional computer vision detection platform</p>
            </div>
          </div>

          <div className="nav-pill">YOLOv8 Machine Learning Model</div>
        </nav>

        <section className="hero">
          <div className="hero-content">
            <span className="badge">AI-ML POWERED COMPUTER VISION</span>

            <h1>Detect Objects With Professional Precision</h1>

            <p>
              Upload an image and instantly detect multiple objects with
              bounding boxes, confidence scores, object counts, and downloadable
              results.
            </p>

            <div className="hero-actions">
              <label className="primary-upload">
                Upload Image
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </label>

              <button onClick={detectObjects}>Start Detection</button>
            </div>
          </div>

          <div className="hero-card">
            <div className="card-top">
              <div>
                <h2>Live Preview</h2>
                <p>{previewImage ? "Image selected" : "Waiting for image"}</p>
              </div>
            </div>

            <div className="preview-box">
              {previewImage ? (
                <img src={previewImage} alt="Preview" />
              ) : (
                <div className="empty-box">
                  <span>📷</span>
                  <h3>No image uploaded</h3>
                  <p>Select an image to begin detection</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <span>🎯</span>
            <h3>Object Detection</h3>
            <p>Detects multiple objects using YOLO ML model.</p>
          </div>

          <div className="feature">
            <span>📊</span>
            <h3>Smart Counting</h3>
            <p>Automatically counts detected object categories.</p>
          </div>

          <div className="feature">
            <span>⚡</span>
            <h3>Fast Processing</h3>
            <p>Clean backend processing with quick results.</p>
          </div>

          <div className="feature">
            <span>⬇️</span>
            <h3>Download Output</h3>
            <p>Download uploaded and detected result images.</p>
          </div>
        </section>

        {loading && (
          <section className="loading-card">
            <div className="spinner"></div>
            <h2>Analyzing image...</h2>
            <p>ML VisionAI is detecting objects. Please wait.</p>
          </section>
        )}

        <section className="stats">
          <div className="stat">
            <p>Total Objects</p>
            <h3>{total}</h3>
          </div>

          <div className="stat">
            <p>Unique Classes</p>
            <h3>{Object.keys(counts).length}</h3>
          </div>

          <div className="stat">
            <p>Highest Confidence</p>
            <h3>{highestConfidence.toFixed(1)}%</h3>
          </div>

          <div className="stat">
            <p>Top Object</p>
            <h3 className="capitalize">{topObject}</h3>
          </div>
        </section>

        <section className="workspace">
          <div className="image-card">
            <div className="card-header">
              <div>
                <h2>Uploaded Image</h2>
                <p>Original selected image</p>
              </div>

              {previewImage && (
                <button
                  className="small-btn"
                  onClick={() => downloadImage(previewImage, "uploaded-image.jpg")}
                >
                  Download
                </button>
              )}
            </div>

            <div className="image-box">
              {previewImage ? (
                <img src={previewImage} alt="Uploaded" />
              ) : (
                <div className="empty-box">
                  <p>No uploaded image</p>
                </div>
              )}
            </div>
          </div>

          <div className="image-card">
            <div className="card-header">
              <div>
                <h2>Detected Result</h2>
                <p>Image with bounding boxes</p>
              </div>

              {detectedImage && (
                <button
                  className="small-btn"
                  onClick={() =>
                    downloadImage(detectedImage, "detected-result.jpg")
                  }
                >
                  Download
                </button>
              )}
            </div>

            <div className="image-box">
              {detectedImage ? (
                <img src={detectedImage} alt="Detected Result" />
              ) : (
                <div className="empty-box">
                  <p>Detected image will appear here</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="results-grid">
          <div className="result-card">
            <div className="section-title">
              <h2>Object Count</h2>
              <p>Grouped object results</p>
            </div>

            <div className="count-grid">
              {Object.keys(counts).length > 0 ? (
                Object.entries(counts).map(([name, count]) => (
                  <div className="count-card" key={name}>
                    <span>{name}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              ) : (
                <div className="empty-box">
                  <p>No objects detected yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="result-card">
            <div className="section-title">
              <h2>Detected Objects</h2>
              <p>Confidence score for each object</p>
            </div>

            <div className="object-grid">
              {objects.length > 0 ? (
                objects.map((obj, index) => (
                  <div className="object-card" key={index}>
                    <div className="object-row">
                      <h4>{obj.name}</h4>
                      <span>{obj.confidence}%</span>
                    </div>

                    <div className="progress">
                      <div
                        className="progress-fill"
                        style={{ width: `${obj.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-box">
                  <p>Detection details will appear here</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;