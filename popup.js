getCurrentTab().then(async ({ id, title, url }) => {
  await chrome.scripting
    .executeScript({
      target: { tabId: id },
      function: () => getSelection().toString(),
    })
    .then(([{ result }]) => {
      document.getElementById("description").value = result.trimLeft();
    })
    .catch((error) => console.log(error));

  document.getElementById("tabTitle").innerHTML = `<strong>${title}</strong>`;
  document.getElementById("tabUrl").innerText = url;

  document.getElementById("sendLinkBtn").addEventListener("click", () => {
    const description = document.getElementById("description").value;
    chrome.storage.sync
      .get()
      .then((result) => {
        if (result.webhookId && result.webhookToken) {
          const API_ENDPOINT = "https://discord.com/api/v10";
          const formData = new FormData();
          const content = `======\n**${title}**\n${url}\n${description}`;
          formData.append("content", content);

          fetch(
            `${API_ENDPOINT}/webhooks/${result.webhookId}/${result.webhookToken}?wait=true`,
            {
              method: "post",
              body: formData,
            }
          )
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              document.getElementById("success").innerText =
                "✅ Sucessfully added";
            })
            .catch((error) =>
              console.log({
                error,
              })
            );
        } else {
          console.log("Invalid webhook ID and/or token");
        }
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(description);
  });

  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.close();
  });

  document.getElementById("dropupBtn").addEventListener("click", () => {
    const dropupDiv = document.getElementById("dropupContent");

    dropupDiv.style.display =
      dropupDiv.style.display !== "block" ? "block" : "none";
  });

  document
    .getElementById("wId")
    .addEventListener("input", toggleDisableSaveBtn);
  document
    .getElementById("wToken")
    .addEventListener("input", toggleDisableSaveBtn);

  document.getElementById("wId").addEventListener("click", (e) => {
    e.target.select();
  });
  document.getElementById("wToken").addEventListener("click", (e) => {
    e.target.select();
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    const wId = document.getElementById("wId");
    const wToken = document.getElementById("wToken");
    const webhookId = wId.value;
    const webhookToken = wToken.value;

    if (webhookId && webhookToken) {
      chrome.storage.sync
        .set({ webhookId: webhookId, webhookToken, webhookToken })
        .then(() => {
          console.log("freshly set");
        });
    }
  });

  window.onclick = function (event) {
    if (
      event.target.matches("#dropupContent") ||
      event.target.matches("input") ||
      event.target.matches("label")
    ) {
      console.log("don't do this");
      return;
    }
    if (!event.target.matches("#dropupBtn")) {
      document.getElementById("dropupContent").style.display = "none";
    }
  };
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };

  let [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  return tab;
}

function toggleDisableSaveBtn() {
  if (
    document.getElementById("wId").value.length > 0 &&
    document.getElementById("wToken").value.length > 0
  ) {
    document.getElementById("saveBtn").disabled = false;
  } else {
    document.getElementById("saveBtn").disabled = true;
  }
}

chrome.storage.sync
  .get()
  .then((result) => {
    if (result.webhookId && result.webhookToken) {
      console.log("saved", result);
      document.getElementById("wId").value = result.webhookId;
      document.getElementById("wToken").value = result.webhookToken;
    } else {
      document.getElementById("wId").value = "";
      document.getElementById("wToken").value = "";
    }
  })
  .catch((error) => {
    console.log(error);
  });

//app icon
//<a href="https://www.flaticon.com/free-icons/broke" title="broke icons">Broke icons created by berkahicon - Flaticon</a>
