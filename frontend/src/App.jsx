import { useState } from "react";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [objects, setObjects] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setResultImage(null);
    setObjects([]);
    setCounts({});
  };

  const detectObjects = async () => {
    if (!selectedImage) {
      alert("Please upload an image first");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch("http://127.0.0.1:5000/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setResultImage(`data:image/jpeg;base64,${data.image}`);
      setObjects(data.objects || []);
      setCounts(data.counts || {});
    } catch (error) {
      alert("Backend not running. Start Flask server first.");
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

  const totalObjects = objects.length;
  const uniqueClasses = Object.keys(counts).length;

  const highestConfidence =
    objects.length > 0 ? Math.max(...objects.map((o) => o.confidence)) : 0;

  const topObject =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  return (
    <div className="app">
      <main className="page">
        <nav className="navbar">
          <div className="brand">
            <div className="brand-icon">ML</div>

            <div>
              <h1 className="logo-title">ML VisionAI</h1>
              <h2 className="logo-subtitle">Multi-Object Detection System</h2>
              <p>Professional computer vision detection platform</p>
            </div>
          </div>

          <div className="model-pill">YOLOv8 Machine Learning Model</div>
        </nav>

        <section className="hero-grid">
          <div className="hero-card">
            <div className="badge">AI-ML POWERED COMPUTER VISION</div>

            <h1 className="hero-title">
              <span>Detect Objects With</span>
              <span>Professional</span>
              <span>Precision</span>
            </h1>

            <p className="hero-text">
              Upload an image and instantly detect multiple objects with
              bounding boxes, confidence scores, object counts, and downloadable
              results.
            </p>

            <div className="hero-actions">
              <label className="primary-btn">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              <button className="secondary-btn" onClick={detectObjects}>
                Start Detection
              </button>
            </div>
          </div>

          <div className="preview-card">
            <h2>Live Preview</h2>
            <p>{preview ? "Image selected" : "Waiting for image"}</p>

            <div className="preview-box">
              {preview ? (
                <img src={preview} alt="preview" />
              ) : (
                <div className="empty">
                  <div className="empty-icon">📷</div>
                  <h3>No image uploaded</h3>
                  <p>Select an image to begin detection</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <div className="feature-icon blue">◎</div>
            <div>
              <h3>Object Detection</h3>
              <p>Detects multiple objects using YOLO ML model.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon cyan">▥</div>
            <div>
              <h3>Smart Counting</h3>
              <p>Automatically counts detected object categories.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon green">⚡</div>
            <div>
              <h3>Fast Processing</h3>
              <p>Clean backend processing with quick results.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon purple">↓</div>
            <div>
              <h3>Download Output</h3>
              <p>Download uploaded and detected result images.</p>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="stat">
            <p>Total Objects</p>
            <h3>{totalObjects}</h3>
          </div>

          <div className="stat">
            <p>Unique Classes</p>
            <h3>{uniqueClasses}</h3>
          </div>

          <div className="stat">
            <p>Highest Confidence</p>
            <h3>{highestConfidence}%</h3>
          </div>

          <div className="stat">
            <p>Top Object</p>
            <h3>{topObject}</h3>
          </div>
        </section>

        {loading && (
          <div className="loading-card">
            <div className="spinner"></div>
            <h3>Analyzing image...</h3>
            <p>YOLO is detecting objects. Please wait.</p>
          </div>
        )}

        <section className="workspace">
          <div className="image-card">
            <div className="card-head">
              <div>
                <h2>Uploaded Image</h2>
                <p>Original selected image</p>
              </div>

              <button
                className="download-btn"
                onClick={() => downloadImage(preview, "uploaded-image.png")}
              >
                Download
              </button>
            </div>

            <div className="image-box">
              {preview ? (
                <img src={preview} alt="uploaded" />
              ) : (
                <div className="empty">No uploaded image</div>
              )}
            </div>
          </div>

          <div className="image-card">
            <div className="card-head">
              <div>
                <h2>Detected Result</h2>
                <p>Image with bounding boxes</p>
              </div>

              <button
                className="download-btn"
                onClick={() =>
                  downloadImage(resultImage, "detected-result.png")
                }
              >
                Download
              </button>
            </div>

            <div className="image-box">
              {resultImage ? (
                <img src={resultImage} alt="detected result" />
              ) : (
                <div className="empty">Detected image will appear here</div>
              )}
            </div>
          </div>
        </section>

        <section className="results-grid">
          <div className="result-card">
            <h2>Object Count</h2>
            <p>Grouped object results</p>

            <div className="count-grid">
              {Object.keys(counts).length > 0 ? (
                Object.entries(counts).map(([name, count]) => (
                  <div className="count-card" key={name}>
                    <span>{name}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              ) : (
                <div className="empty">No objects detected yet</div>
              )}
            </div>
          </div>

          <div className="result-card">
            <h2>Detected Objects</h2>
            <p>Confidence score for each object</p>

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
                <div className="empty">Detection details will appear here</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;