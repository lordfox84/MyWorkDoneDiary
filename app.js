document.addEventListener("DOMContentLoaded", () => {
  const formOverlay = document.getElementById("formOverlay");
  const workForm = document.getElementById("workForm");
  const dateInput = document.getElementById("datePicker");
  const descriptionInput = document.getElementById("workDescription");
  const hoursInput = document.getElementById("timeOfWork");

  // Zobrazí formulář
  window.showForm = function () {
    formOverlay.classList.remove("hidden");
    formOverlay.classList.add("visible");
  };

  // Skryje formulář
  window.hideForm = function () {
    formOverlay.classList.add("hidden");
    formOverlay.classList.remove("visible");
    resetForm();
  };

  // Reset formuláře
  window.resetForm = function () {
    workForm.reset();
  };

  // Při kliknutí mimo container zavřít modal
  formOverlay.addEventListener("click", function (e) {
    if (e.target === formOverlay) {
      hideForm();
    }
  });

  // Zápis dat do Firestore
  window.recordWork = function () {
    const work = {
      date: dateInput.value,
      description: descriptionInput.value,
      hours: hoursInput.value,
    };

    const db = firebase.firestore();
    db.collection('work').add(work)
      .then(() => {
        console.log('Záznam uložen.');
        hideForm();
        showRecords();
      })
      .catch((error) => {
        console.error('Chyba při ukládání: ', error);
      });
  };

  // Načíst záznamy
  window.showRecords = function () {
    const db = firebase.firestore();
    const recordsList = document.getElementById("recordsList");
    recordsList.innerHTML = "";

    db.collection("work").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const record = doc.data();
        const li = document.createElement("li");
        li.textContent = `${record.date} – ${record.hours} – ${record.description}`;
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Smazat";
        deleteBtn.onclick = () => deleteRecord(doc.id);
        li.appendChild(deleteBtn);
        recordsList.appendChild(li);
      });
    });
  };

  // Mazání záznamu
  window.deleteRecord = function (id) {
    const db = firebase.firestore();
    db.collection("work").doc(id).delete()
      .then(() => {
        console.log("Záznam smazán.");
        showRecords();
      })
      .catch((error) => {
        console.error("Chyba při mazání: ", error);
      });
  };

  // Zobrazení dnešního data
  const dateElement = document.getElementById("todayDate");
  const today = new Date();
  dateElement.textContent = today.toLocaleDateString("cs-CZ", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Načíst záznamy hned po načtení
  showRecords();
});


// Načíst záznamy, seskupit podle data a zobrazit
window.showRecords = function () {
  const db = firebase.firestore();
  const recordsList = document.getElementById("recordsList");
  recordsList.innerHTML = ""; // Resetovat seznam

  db.collection("work").get().then((querySnapshot) => {
    const recordsByDate = {};

    // Seskupíme záznamy podle data
    querySnapshot.forEach((doc) => {
      const record = doc.data();
      const recordDate = record.date;
      if (!recordsByDate[recordDate]) {
        recordsByDate[recordDate] = {
          date: recordDate,
          hours: 0,
          records: []
        };
      }
      recordsByDate[recordDate].records.push(record);
      recordsByDate[recordDate].hours += parseFloat(record.hours);
    });

    // Pro každý den vytvoříme záhlaví a záznamy
    for (const date in recordsByDate) {
      const dateData = recordsByDate[date];
      
      // Vytvoříme záhlaví pro daný den
      const dayHeader = document.createElement("div");
      dayHeader.classList.add("day-header");

      const dateText = document.createElement("span");
      dateText.textContent = dateData.date;
      dayHeader.appendChild(dateText);

      const totalHours = document.createElement("span");
      totalHours.textContent = `Součet: ${dateData.hours} h`;
      dayHeader.appendChild(totalHours);

      recordsList.appendChild(dayHeader);

      // Vytvoříme záznamy pro daný den
      dateData.records.forEach((record) => {
        const recordItem = document.createElement("div");
        recordItem.classList.add("record-item");

        const recordText = document.createElement("p");
        recordText.textContent = `${record.date} – ${record.hours} h – ${record.description}`;
        recordItem.appendChild(recordText);

        recordsList.appendChild(recordItem);
      });
    }
  });
};