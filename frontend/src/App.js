import { useState, useRef } from "react";
import "./index.css";

function App() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileDropClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
  
    setIsLoading(true);
    setShowPopup(true);
  
    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      // Add a timeout to the fetch request to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setResult({ 
        error: `Failed to analyze image: ${error.message}`, 
        success: false 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setResult(null);
  };

  return (
    <div className="bg-[#F3F3F3] py-2 px-3">
      <div className="flex flex-row-reverse justify-between">
        <main className="flex flex-col justify-start items-start">
          <img src={"navy.svg"} alt="" className="mb-5" />

          <div className="flex flex-row justify-between gap-10">
            <img src={"main.svg"} alt="" />
            <img src={"map.svg"} alt="" />
          </div>

          <div className="flex flex-row-reverse justify-between">
            <img src="news.svg"></img>

            <div className="flex flex-col">
              <div className="flex felx-row">
                <div className="w-[289px] h-[234px] shadow-md rounded-[13px] mt-5 p-5 bg-white">
                  <img src={"header.svg"}></img>

                  {/* This is the file input area - now functional */}
                  <div onClick={handleFileDropClick} style={{ cursor: "pointer" }}>
                    <img src={"filedrop.svg"} className="mt-3"></img>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </div>

                  {/* File name display if file is selected */}
                  {file && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {file.name}
                    </div>
                  )}

                  {/* Button now functional */}
                  <button onClick={handleAnalyze}>
                    <img className="mt-2" src="button.svg"></img>
                  </button>
                </div>
                
                <img className="mt-5 ml-5" src="table.svg"></img>
              </div>

              <img src="multifactor.svg" className="mt-5"></img>
            </div>
          </div>
        </main>

        <aside>
          <img src={"sidebar.svg"} alt="" />
        </aside>
      </div>

      {/* Popup for loading and results */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            {isLoading ? (
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-lg font-medium">Analyzing your image...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex flex-row justify-center items-center mb-2">
                <img src="header.svg"></img>
                </div>
                {result && result.error ? (
                  <p className="text-red-500">{result.error}</p>
                ) : result && (
                  <>
                    <p className="text-lg mb-2">
                      {result.prediction}
                    </p>
                    <p className="text-lg mb-4">
                      <span className="font-semibold">Confidence:</span> {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </>
                )}
                <button
                  onClick={closePopup}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;