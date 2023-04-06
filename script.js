document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById("searchForm");
  const result = document.getElementById("result");
  const stopButton = document.getElementById("stopButton");

  let searchInterval;
  let countdownTimeout;
  let intervalId = 5; // Add a variable to hold the interval ID for Audio repeat

  searchForm.addEventListener("submit", (e) => {
	e.preventDefault();

	const url = document.getElementById("url").value;
	const searchString = document.getElementById("searchString").value.toLowerCase();
	const interval = document.getElementById("interval").value * 1000;
	const title = document.querySelector("h1");
	title.classList.add("shaking"); // Add the 'shaking' class when the script is active

	result.textContent = "Starting search...";
	stopButton.disabled = false;

	let searchCount = 0;

	const performSearch = () => {
	  searchCount++;
	  result.textContent = `Search attempt #${searchCount}: Fetching content from URL...`;
	
	  fetch(url)
		.then((response) => {
		  if (response.ok) {
			return response.text();
		  } else {
			throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
		  }
		})
		.then((html) => {
		  const lowerCaseHtml = html.toLowerCase();
		  const searchStringIndex = lowerCaseHtml.indexOf(searchString);
	
		  if (searchStringIndex >= 0) {
			result.textContent = `Search attempt #${searchCount}: Found the search string! Stopping search.`;
			clearInterval(searchInterval);
			stopButton.disabled = true;
			playNotificationSound();
		  } else {
			startCountdown(interval);
		  }
		})
		.catch((error) => {
		  result.textContent = `Search attempt #${searchCount}: Error - ${error}. Retrying in ${interval / 1000} seconds...`;
		});
	};
	
	const startCountdown = (interval) => {
	  let remainingSeconds = interval / 1000;
	
	  const updateCountdown = () => {
		result.textContent = `Search attempt #${searchCount}: Search string not found. Retrying in ${remainingSeconds} seconds...`;
		remainingSeconds--;
	
		if (remainingSeconds >= 0) {
			countdownTimeout = setTimeout(updateCountdown, 1000);
		}
	  };
	
	  updateCountdown();
	};

	performSearch();

	searchInterval = setInterval(performSearch, interval);
  });

  function playNotificationSound() {
	const soundSelect = document.getElementById("notificationSound");
	const selectedSound = soundSelect.value;
  
	console.log('Playing notification sound:', selectedSound);
  
	const sound = document.getElementById(selectedSound);
	sound.currentTime = 0;
  
	// Add an "ended" event listener to the audio element
	sound.addEventListener("ended", () => {
	  console.log("Notification sound ended");
	  playNotificationSound(); // Play the sound again when it ends
	});
  
	sound.play();
  
	// Set an interval to play the sound every 10 seconds
	intervalId = setInterval(() => {
	  sound.currentTime = 0;
	  sound.play();
	}, 10000);
  
	// Show a dialog box and clear the interval when the user clicks OK
	showAlertAndClearInterval(intervalId, sound);
  }


  
  function showAlertAndClearInterval(intervalId, sound) {
	const soundSelect = document.getElementById("notificationSound");
	const selectedSound = soundSelect.value;
  
	const alertPromise = new Promise((resolve) => {
	  alert("Search string found! Close this to stop the sound.");
	  resolve();
	});
  
	alertPromise.then(() => {
	  clearInterval(intervalId);
	  sound.pause();
	  sound.currentTime = 0;
	});
  }


  stopButton.addEventListener("click", () => {
	clearInterval(searchInterval);
	clearTimeout(countdownTimeout); // Clear the countdown timeout
	result.textContent = "Search stopped.";
	stopButton.disabled = true;
	const title = document.querySelector("h1");
	title.classList.remove("shaking"); // Remove the 'shaking' class when the script is stopped
  });
});
