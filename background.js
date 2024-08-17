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

chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.url && !tab.groupId) {
    const rootDomain = getRootDomain(tab.url);

    let groupId = null;
    let groupColor = null;

    // Get all the groups in the current window
    const groups = await chrome.tabGroups.query({ windowId: tab.windowId });

    // Check if there is already a group for this root domain
    for (const group of groups) {
      const groupTabs = await chrome.tabs.query({ groupId: group.id });
      if (groupTabs.length > 0) {
        const groupRootDomain = getRootDomain(groupTabs[0].url);
        if (groupRootDomain === rootDomain) {
          groupId = group.id;
          groupColor = group.color;
          break;
        }
      }
    }

    // Assign a color to the group (you can customize these)
    const colors = ["blue", "red", "green", "yellow", "purple", "pink"];
    if (!groupColor) {
      groupColor = colors[groups.length % colors.length];
    }

    // If no group exists for the root domain, create one
    if (!groupId) {
      groupId = await chrome.tabs.group({ tabIds: tab.id });
      await chrome.tabGroups.update(groupId, { color: groupColor });
    } else {
      // Add the tab to the existing group
      await chrome.tabs.group({ groupId: groupId, tabIds: tab.id });
    }
  }
});
