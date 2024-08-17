document.getElementById("groupTabs").addEventListener("click", async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  
  // Function to extract the root domain (e.g., tcsion.com)
  function getRootDomain(url) {
    const domain = new URL(url).hostname;
    const parts = domain.split('.').reverse();

    // Handle cases like "sub.domain.tld" or "domain.co.uk"
    if (parts.length > 2 && parts[1].length === 2 && parts[0].length === 2) {
      return parts[2] + '.' + parts[1] + '.' + parts[0];
    } else {
      return parts[1] + '.' + parts[0];
    }
  }

  const groups = {};
  const colors = ["blue", "red", "green", "yellow", "purple", "pink"];

  // Iterate over each tab
  for (const tab of tabs) {
    const rootDomain = getRootDomain(tab.url);

    // If the root domain is not already in a group, create one
    if (!groups[rootDomain]) {
      groups[rootDomain] = await chrome.tabs.group({ tabIds: tab.id });
      const groupColor = colors[Object.keys(groups).length % colors.length];
      await chrome.tabGroups.update(groups[rootDomain], { color: groupColor });
    } else {
      // If the root domain already has a group, add the tab to it
      await chrome.tabs.group({ groupId: groups[rootDomain], tabIds: tab.id });
    }
  }
});
