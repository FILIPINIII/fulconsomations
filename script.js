const fuelPricePerLitre = 14; // سعر اللتر بالدرهم

window.onload = function() {
  let savedConsumption = localStorage.getItem("fuelConsumption");
  if (savedConsumption) {
    document.getElementById("fuelConsumption").value = savedConsumption;
    document.getElementById("engineConsumptionSection").style.display = "none";
    document.getElementById("editConsumptionBtn").style.display = "block";
  } else {
    document.getElementById("engineConsumptionSection").style.display = "block";
    document.getElementById("editConsumptionBtn").style.display = "none";
  }
  loadFuelLog();
  initMap();
};

function calculateDistance() {
    let fuelAmount = parseFloat(document.getElementById("fuelAmount").value);
    let fuelConsumption = parseFloat(document.getElementById("fuelConsumption").value);
    let currentOdometer = parseFloat(document.getElementById("currentOdometer").value);

    if (fuelAmount > 0 && fuelConsumption > 0) {
        let litresBought = fuelAmount / fuelPricePerLitre;
        let possibleDistance = litresBought * fuelConsumption;

        let resultText = `يمكنك القيادة لمسافة ${possibleDistance.toFixed(2)} كم بهذا البنزين.`;

        if (!isNaN(currentOdometer) && currentOdometer > 0) {
            let futureOdometer = currentOdometer + possibleDistance;
            resultText += `\n📍 العداد بعد استهلاك البنزين: ${futureOdometer.toFixed(0)} كم`;
        }

        document.getElementById("result").innerText = resultText;
        saveToFuelLog(possibleDistance, litresBought, fuelConsumption);
    } else {
        document.getElementById("result").innerText = "يرجى إدخال قيم صحيحة!";
    }
}

function calculateEngineConsumption() {
  let fuelAmountSpent = parseFloat(document.getElementById("fuelAmountSpent").value);
  let distanceDrivenSpent = parseFloat(document.getElementById("distanceDrivenSpent").value);

  if (fuelAmountSpent > 0 && distanceDrivenSpent > 0) {
    let litresBought = fuelAmountSpent / fuelPricePerLitre;
    let efficiency = distanceDrivenSpent / litresBought;
    
    localStorage.setItem("fuelConsumption", efficiency.toFixed(2));
    document.getElementById("fuelConsumption").value = efficiency.toFixed(2);
    document.getElementById("calculationResultSpent").innerText = `🚗 استهلاك المحرك: ${efficiency.toFixed(2)} كم/لتر`;
    
    saveToFuelLog(distanceDrivenSpent, litresBought, efficiency);
    
    document.getElementById("engineConsumptionSection").style.display = "none";
    document.getElementById("editConsumptionBtn").style.display = "block";
    
    alert(`✅ تم حساب استهلاك المحرك: ${efficiency.toFixed(2)} كم/لتر`);
  } else {
    alert("⚠️ المرجو إدخال قيم صحيحة!");
  }
}

function editConsumption() {
  document.getElementById("engineConsumptionSection").style.display = "block";
  document.getElementById("editConsumptionBtn").style.display = "none";
}

function saveToFuelLog(distance, fuel, efficiency) {
  let fuelLog = JSON.parse(localStorage.getItem("fuelLog")) || [];
  let logEntry = {
    date: new Date().toLocaleString(),
    distance: distance,
    fuel: fuel.toFixed(2),
    efficiency: efficiency.toFixed(2)
  };
  fuelLog.push(logEntry);
  localStorage.setItem("fuelLog", JSON.stringify(fuelLog));
  loadFuelLog();
}

function loadFuelLog() {
  let fuelLog = JSON.parse(localStorage.getItem("fuelLog")) || [];
  let logList = document.getElementById("fuelLog");
  logList.innerHTML = "";
  fuelLog.forEach(entry => {
    let listItem = document.createElement("li");
    listItem.innerText = `📅 ${entry.date} - 🏁 ${entry.distance} كم - ⛽ ${entry.fuel} لتر - 🔥 ${entry.efficiency} كم/لتر`;
    logList.appendChild(listItem);
  });
}

function clearFuelLog() {
    if (confirm("⚠️ هل أنت متأكد أنك تريد مسح سجل الاستهلاك؟")) {
        localStorage.removeItem("fuelLog");
        loadFuelLog();
        alert("🗑️ تم مسح السجل بنجاح!");
    }
}

function initMap() {
    var map = L.map('map').setView([33.5731, -7.5898], 13); // إحداثيات الدار البيضاء

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLocation = [position.coords.latitude, position.coords.longitude];
            
            L.marker(userLocation).addTo(map)
                .bindPopup('موقعك الحالي')
                .openPopup();
            
            map.setView(userLocation, 13);
            findNearestFuelStation(userLocation, map);
        });
    } else {
        alert("لا يمكن تحديد موقعك.");
    }
}

function findNearestFuelStation(userLocation, map) {
    const apiUrl = `https://nominatim.openstreetmap.org/search?lat=${userLocation[0]}&lon=${userLocation[1]}&radius=5000&format=json&amenity=fuel`;

    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            const nearestStation = data[0];
            L.marker([nearestStation.lat, nearestStation.lon])
                .addTo(map)
                .bindPopup(`أقرب محطة وقود: ${nearestStation.display_name}`)
                .openPopup();
        } else {
            alert("لم يتم العثور على محطات وقود قريبة.");
        }
    });
}
