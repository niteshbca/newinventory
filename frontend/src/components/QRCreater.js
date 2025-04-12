import React, { useState, useEffect } from "react";
import Barcode from "react-barcode";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const QRCreater = () => {
  const [product, setProduct] = useState("");
  const [packed, setPacked] = useState("");
  const [batch, setBatch] = useState("");
  const [shift, setShift] = useState("");
  const [numberOfBarcodes, setNumberOfBarcodes] = useState(1);
  const [location, setLocation] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [rewinder, setRewinder] = useState("");
  const [edge, setEdge] = useState("");
  const [winder, setWinder] = useState("");
  const [mixer, setMixer] = useState("");
  const [skuc, setSku] = useState("");
  const [skun, setSKU] = useState("");
  const [batchNumbers, setBatchNumbers] = useState([]);

  // Fetch location using OpenCage API or reverse geolocation API
  const fetchLocation = async (lat, long) => {
    const apiKey = "1a49c2f11ba74841bb2b563c7569b33c"; // Replace with your OpenCage API key
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=${apiKey}`
      );
      const { city, state, country } = response.data.results[0].components;
      setLocation(`${city || ""}, ${state}, ${country || ""}`);
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocation("Location Unavailable");
    }
  };

  // Get current time and location on component mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchLocation(latitude, longitude); // Automatically get location from the device
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocation("Location Unavailable");
      }
    );

    // Set current time
    const date = new Date();
    setCurrentTime(date.toLocaleString());
  }, []);

  // Handle batch number collection and increment
  useEffect(() => {
    if (batch) {
      const startBatchNumber = parseInt(batch);
      setBatchNumbers(
        Array.from({ length: numberOfBarcodes }, (_, index) => startBatchNumber + index)
      );
    }
  }, [batch, numberOfBarcodes]);

  // Function to handle PDF creation for individual barcodes
  const handleDownloadAllBarcodesPDF = async () => {
    const doc = new jsPDF({
      orientation: "portrait", // portrait for 4x6 size (portrait is more common for small printouts)
      unit: "in",
      format: [4, 6], // Setting page size to 4x6 inches
    });

    // Loop through each barcode and add it to the PDF
    for (let index = 0; index < numberOfBarcodes; index++) {
      const barcodeDiv = document.getElementById(`barcode-div-${index}`);

      if (barcodeDiv) {
        // Use html2canvas to capture only the contents of the barcode div
        const canvas = await html2canvas(barcodeDiv, {
          scrollX: 0,
          scrollY: -window.scrollY, // Adjust for any page scroll
          x: 0,
          y: 0,
          width: barcodeDiv.offsetWidth,
          height: barcodeDiv.offsetHeight,
          useCORS: true, // Enable CORS to fetch external images (if any)
          backgroundColor: null, // Make the background transparent
          removeContainer: true, // Remove the outer container to avoid border and background color
        });

        const imgData = canvas.toDataURL("image/png");

        // If not the first barcode, add a new page to the PDF
        if (index > 0) {
          doc.addPage();
        }

        // Add the barcode image to the PDF
        doc.addImage(imgData, "PNG", 0.5, 0.5, 3, 5.5); // Scale the image to fit in the page size
      }
    }

    // Save the PDF with all barcodes
    doc.save("barcodes.pdf");
  };

  // Function to handle printing of the final barcode
  const handlePrint = () => {
    const content = document.getElementById("barcode-total");

    if (content) {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Final Barcode</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                text-align: center;
              }
              .barcode-container {
                width: 4in;
                height: 6in;
                text-align: center;
                margin: auto;
                font-weight: bold; /* Bold font */
                border: 1px solid #000; /* Optional border for the print layout */
              }
            </style>
          </head>
          <body>
            <div class="barcode-container">${content.innerHTML}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };


   // Function to handle saving data to the database
   const handleSaveToDatabase = async () => {
    const formData = {
      product,
      packed,
      batch,
      shift,
      numberOfBarcodes,
      location,
      currentTime,
      rewinder,
      edge,
      winder,
      mixer,
      skuc,
      skun,
      batchNumbers
    };

    try {
      const response = await axios.post("http://localhost:5000/api/saved", formData);
      alert(response.data.message);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data.");
    }
  };

  return (
    <div style={styles.container1}>
          <style>{globalStyles}</style>
    <div style={styles.container}>
      <h2 style={styles.heading}>Generate Barcodes</h2>

      <div style={styles.form}>
      <input
          type="text"
          placeholder="Product name"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Packed by"
          value={packed}
          onChange={(e) => setPacked(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Batch no"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Shift-Day/Night"
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Rewinder operator"
          value={rewinder}
          onChange={(e) => setRewinder(e.target.value)}
          required
          style={styles.input}
        />
         <input
          type="text"
          placeholder="Edge Cut Operator"
          value={edge}
          onChange={(e) => setEdge(e.target.value)}
          required
          style={styles.input}
        />
         <input
          type="text"
          placeholder="Winder Operator"
          value={winder}
          onChange={(e) => setWinder(e.target.value)}
          required
          style={styles.input}
        />
         <input
          type="text"
          placeholder="Mixer Operator"
          value={mixer}
          onChange={(e) => setMixer(e.target.value)}
          required
          style={styles.input}
        />
         <input
          type="text"
          placeholder="SKU code no"
          value={skuc}
          onChange={(e) => setSku(e.target.value)}
          required
          style={styles.input}
        />
         <input
          type="text"
          placeholder="SKU Name"
          value={skun}
          onChange={(e) => setSKU(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Number of Barcodes"
          value={numberOfBarcodes}
          onChange={(e) => setNumberOfBarcodes(e.target.value)}
          required
          style={styles.input}
        />
        
        <button   onClick={() => {
    handleSaveToDatabase(); 
    window.location.reload(); // Page refresh karega
  }}  style={styles.printButton}>
          Add
        </button>

         {/* Download All Barcodes PDF button */}
      <button onClick={handleDownloadAllBarcodesPDF} style={styles.printButton}>
        Download All Barcodes as PDF
      </button>


      {/* Print Final Barcode button */}
      <button onClick={handlePrint} style={styles.printButton}>
        Print Final Barcode
      </button>

      </div>



      {/* Generate individual barcodes */}
      {Array.from({ length: numberOfBarcodes }).map((_, index) => (
        <div
          id={`barcode-div-${index}`}
          key={index}
          style={styles.barcodeContainer}
        >
          {/* Only batch number in the barcode value */}
          <Barcode
            value={`${batchNumbers[index]}`}  // Only batch number
            width={2}
            height={60}
            fontSize={28}
          />

         <div style={styles.barcodeDetails}>
          {/* Displaying batch number only */}
           <p style={{color:"black", fontSize:"15px", fontWeight:"bold"}}>
           
            <p>Batch No: {batch}</p>
            <p>SKU code no: {skuc}</p>
            <p>SKU Name: {skun}</p>
            <p>Location: {location}</p>
            <p>Packing Date: {currentTime}</p></p>
           
          </div>
        </div>
      ))}

     

      {/* Final barcode with the start and end batch numbers */}
      <div
        id="barcode-total"
        style={styles.finalBarcodeContainer}
      >
        <h3 style={styles.finalBarcodeHeading}>Final Barcode</h3>

        {/* Final barcode value showing batch number range */}
    
        <Barcode
          value={`${batchNumbers[0]}-${batchNumbers[batchNumbers.length - 1]}`} // Batch number range
          width={2}
          height={60}
          fontSize={28}
        />
        <div style={styles.barcodeDetails}>
          {/* Displaying batch number range */}
          <p style={{color:"black", fontSize:"15px"}}>  
            <h1>Batch No:  {batchNumbers[batchNumbers.length - 1]}</h1>
            <h1>SKU code no: {skuc}</h1>
            <h1>SKU Name: {skun}</h1>
        
          <h1>Location: {location}</h1>
          <h1>Packing Date: {currentTime}</h1></p>
         
          
        </div>
      </div>

    </div>
    </div>
  );
};

const styles = {
  container1: {
    textAlign: "center",
    padding: "30px",
    fontFamily: "'Arial', sans-serif",
    background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 12s ease infinite',
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "1500px",
    margin: "auto",
  },
  container: {
    textAlign: "center",
    padding: "30px",
    fontFamily: "'Arial', sans-serif",
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "800px",
    margin: "auto",
  },
  heading: {
    color: "white",
    marginBottom: "20px",
    fontSize: "44px",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "30px",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "25px",
    width: "100%",
    maxWidth: "350px",
    margin: "0 auto",
  },
  barcodeContainer: {
    margin: "20px",
    padding: "15px",
    border: "none",
    backgroundColor: "transparent",
    textAlign: "left",
    fontSize: "10px",
    fontWeight: "bold",
    display: "inline-block",
    width: "200px",
  },
  barcodeDetails: {
    fontSize: "12px",
    marginTop: "10px",
    color: "#555",
  },


  printButton: {
    margin: "10px",
     width: "100%",
    padding: "8px 15px",
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    color: "white",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
  },

  
  finalBarcodeContainer: {
    margin: "20px",
    padding: "15px",
    border: "none",
    backgroundColor: "transparent",
    textAlign: "left",
    fontSize: "10px",
    fontWeight: "bold",
    display: "inline-block",
    width: "100%",
  },
  finalBarcodeHeading: {
    fontSize: "35px",
    fontWeight: "bold",
    color: "black",
  },
};

const globalStyles = `
@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  25% { background-position: 50% 100%; }
  50% { background-position: 100% 50%; }
  75% { background-position: 50% 0%; }
  100% { background-position: 0% 50%; }
}
`;

export default QRCreater;
