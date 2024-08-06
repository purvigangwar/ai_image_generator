const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");
const MIDJOURNEY_API_KEY = "vk-sPraX3nIgqsDo2U9I372aTXoBxdOSU2wsP2o4nFFSH3EDuF";

let isImageGenerating = false;

const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");

    // Set the image source to the AI-generated image data
    const aiGeneratedImg = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImg;

    // When the image is loaded, remove the loading class and set download attributes
    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", aiGeneratedImg);
      downloadBtn.setAttribute("download", `generated_image_${index + 1}.jpg`);
    };
  });
};

const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    const response = await fetch("https://api.vyro.ai/v1/imagine/api/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MIDJOURNEY_API_KEY}`
      },
      body: JSON.stringify({
        prompt: userPrompt,
        style_id: 1,           // Example style_id, adjust as needed
        aspect_ratio: "1:1",  // Example aspect_ratio
        negative_prompt: "",  // Optional
        cfg: 7.5,             // Example cfg
        seed: 12345,          // Optional, if needed
        steps: 30,            // Example steps
        high_res_results: 0   // Example high_res_results
      }),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Parse the error response
      const errorMessage = errorData.error || "Unknown error"; // Extract error message
      const errorDetails = errorData.details ? errorData.details.join(", ") : ""; // Extract error details if available
      throw new Error(`Failed to generate images! Status: ${response.status}, Message: ${errorMessage}. Details: ${errorDetails}`);
    }

    const data = await response.json();

    if (data.data) {
      updateImageCard(data.data);
    } else {
      throw new Error("No images returned from API.");
    }
  } catch (error) {
    alert(error.message);
  } finally {
    isImageGenerating = false;
  }
};

const handleFormSubmission = (e) => {
  e.preventDefault();

  if (isImageGenerating) return;

  isImageGenerating = true;

  // Get user input and image quantity values from the form
  const userPrompt = e.target.querySelector('input[name="prompt"]').value;
  const userImgQuantity = e.target.querySelector('select[name="quantity"]').value;

  // Creating HTML markup for image cards with loading state
  const imgCardMarkup = Array.from({ length: parseInt(userImgQuantity, 10) }, () => `
    <div class="img-card loading">
      <img src="image/loader.svg" alt="loading">
      <a href="#" class="download-btn">
        <img src="image/download.svg" alt="download icon">
      </a>
    </div>
  `).join("");

  imageGallery.innerHTML = imgCardMarkup;

  generateAiImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleFormSubmission);
