document.getElementById("groupTabs").addEventListener("click", async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  function getRootDomain(url) {
    const domain = new URL(url).hostname;
    const parts = domain.split('.').reverse();

    if (parts.length > 2 && parts[1].length === 2 && parts[0].length === 2) {
      return parts[2] + '.' + parts[1] + '.' + parts[0];
    } else {
      return parts[1] + '.' + parts[0];
    }
  }

  const domainCategories = {
    "workatastartup.com": "YC-Related",
    "ycombinator.com": "YC-Related",
    // Add more domains and their categories as needed
  };

  const groups = {};
  const colors = ["blue", "red", "green", "yellow", "purple", "pink"];

  for (const tab of tabs) {
    const rootDomain = getRootDomain(tab.url);
    const category = domainCategories[rootDomain] || rootDomain;

    if (!groups[category]) {
      groups[category] = await chrome.tabs.group({ tabIds: tab.id });
      const groupColor = colors[Object.keys(groups).length % colors.length];
      await chrome.tabGroups.update(groups[category], { color: groupColor });
    } else {
      await chrome.tabs.group({ groupId: groups[category], tabIds: tab.id });
    }
  }
});

document.getElementById("ungroupTabs").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: 'ungroup' }, (response) => {
    if (response.status === "success") {
      console.log("Tabs successfully ungrouped.");
    } else {
      console.error("Failed to ungroup tabs.");
    }
  });
});

document.getElementById("groupingToggle").addEventListener("change", (event) => {
  const isEnabled = event.target.checked;
  chrome.runtime.sendMessage({ toggleGrouping: isEnabled }, (response) => {
    if (response.status === "success") {
      console.log("Auto Grouping toggle updated successfully.");
    } else {
      console.error("Failed to update Auto Grouping toggle.");
    }
  });
});
