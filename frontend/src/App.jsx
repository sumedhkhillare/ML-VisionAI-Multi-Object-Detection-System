import { useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [detectedImage, setDetectedImage] = useState(null);
  const [objects, setObjects] = useState([]);
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const hasResult = Boolean(detectedImage);

  const avgConfidence = useMemo(() => {
    if (!objects.length) return 0;

    const sum = objects.reduce(
      (acc, obj) => acc + Number(obj.confidence || 0),
      0
    );

    return (sum / objects.length).toFixed(1);
  }, [objects]);

  const bestObject = useMemo(() => {
    if (!objects.length) return "None";

    return objects.reduce((best, current) =>
      Number(current.confidence) > Number(best.confidence) ? current : best
    ).name;
  }, [objects]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
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

      const response = await axios.post(
        "http://127.0.0.1:5000/detect",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setDetectedImage(`data:image/jpeg;base64,${response.data.image}`);
      setObjects(response.data.objects || []);
      setCounts(response.data.counts || {});
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error(error);
      alert("Detection failed. Make sure backend is running properly.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imageUrl, fileName) => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="app">
      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>
      <div className="glow glow-three"></div>

      <main className="page">
        <nav className="navbar">
          <div className="brand">
            <div className="brand-icon">ML</div>

            <div>
              <h3>ML VisionAI</h3>
              <p>Machine Learning Vision System</p>
            </div>
          </div>

          <div className="nav-pill">Computer Vision Project</div>
        </nav>

        <section className="hero">
          <div className="hero-content">
            <div className="badge">AI-ML POWERED COMPUTER VISION</div>

            <h1>ML VisionAI: Multi-Object Detection System</h1>

            <p>
              Upload an image and instantly detect multiple objects using a
              Machine Learning based YOLO model with bounding boxes, confidence
              scores, object counts, and downloadable results.
            </p>

            <div className="hero-actions">
              <label className="primary-upload">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>

              <button onClick={detectObjects} disabled={loading}>
                {loading ? "Detecting..." : "Detect Objects"}
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-top">
              <span>Live Preview</span>
              <small>{selectedImage ? "Image selected" : "Waiting"}</small>
            </div>

            {preview ? (
              <img src={preview} alt="Preview" />
            ) : (
              <div className="preview-empty">
                <span>📷</span>
                <h3>No image selected</h3>
                <p>Upload an image to start detection.</p>
              </div>
            )}
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <span>🎯</span>
            <h3>ML Object Detection</h3>
            <p>Detects multiple objects from a single image using YOLO.</p>
          </div>

          <div className="feature">
            <span>📊</span>
            <h3>Smart Counting</h3>
            <p>Counts same objects like person: 3, car: 2.</p>
          </div>

          <div className="feature">
            <span>⚡</span>
            <h3>Confidence Score</h3>
            <p>Displays confidence percentage for every detected object.</p>
          </div>

          <div className="feature">
            <span>⬇️</span>
            <h3>Download Result</h3>
            <p>Download uploaded and detected result images easily.</p>
          </div>
        </section>

        {loading && (
          <section className="loading-card">
            <div className="spinner"></div>
            <h2>Analyzing image...</h2>
            <p>YOLO is detecting objects. Please wait.</p>
          </section>
        )}

        {preview && (
          <section className="workspace">
            <div className="image-card">
              <div className="card-header">
                <div>
                  <h2>Uploaded Image</h2>
                  <p>Original image selected by user</p>
                </div>

                <button
                  className="small-btn"
                  onClick={() =>
                    downloadImage(preview, selectedImage?.name || "uploaded.jpg")
                  }
                >
                  Download
                </button>
              </div>

              <div className="image-box">
                <img src={preview} alt="Uploaded" />
              </div>
            </div>

            <div className="image-card">
              <div className="card-header">
                <div>
                  <h2>Detected Result</h2>
                  <p>Image with detected bounding boxes</p>
                </div>

                {hasResult && (
                  <button
                    className="small-btn"
                    onClick={() =>
                      downloadImage(detectedImage, "detected-image.jpg")
                    }
                  >
                    Download
                  </button>
                )}
              </div>

              <div className="image-box">
                {hasResult ? (
                  <img src={detectedImage} alt="Detected" />
                ) : (
                  <div className="result-empty">
                    <h3>No detection result yet</h3>
                    <p>Click Detect Objects to generate result.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {hasResult && (
          <>
            <section className="stats">
              <div className="stat">
                <p>Total Objects</p>
                <h3>{total}</h3>
              </div>

              <div className="stat">
                <p>Object Types</p>
                <h3>{Object.keys(counts).length}</h3>
              </div>

              <div className="stat">
                <p>Avg Confidence</p>
                <h3>{avgConfidence}%</h3>
              </div>

              <div className="stat">
                <p>Best Match</p>
                <h3 className="capitalize">{bestObject}</h3>
              </div>
            </section>

            <section className="results-grid">
              <div className="result-card">
                <div className="section-title">
                  <h2>Object Count</h2>
                  <p>Grouped count of detected objects</p>
                </div>

                <div className="count-grid">
                  {Object.entries(counts).map(([name, count]) => (
                    <div className="count-card" key={name}>
                      <span>{name}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-card">
                <div className="section-title">
                  <h2>Detected Objects</h2>
                  <p>Each detected object with confidence score</p>
                </div>

                <div className="object-grid">
                  {objects.map((obj, index) => (
                    <div className="object-card" key={`${obj.name}-${index}`}>
                      <div>
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
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;